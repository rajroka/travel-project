import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { Booking } from "@/lib/db/models/Booking";
import { Invoice } from "@/lib/db/models/Invoice";
import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { requireSession } from "@/lib/auth/session";
import { resolveMongoUser } from "@/lib/auth/resolve-user";
import { initiatePaymentSchema } from "@/lib/validations/payment";
import { createPaymentIntent, retrievePaymentIntent } from "@/lib/payments/stripe";
import { generateInvoiceNumber } from "@/lib/auth/auth";
import { sendMail, paymentReceiptTemplate } from "@/lib/email/mailer";

// POST /api/payments/stripe — create Stripe PaymentIntent
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const body = await req.json();
    const parsed = initiatePaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { bookingId } = parsed.data;

    // Resolve Mongoose user — creates record on first OAuth login
    const mongoUser = await resolveMongoUser(session);

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // Check ownership using Mongoose _id
    if (String(booking.user) !== String(mongoUser._id)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (booking.paymentStatus === "paid") {
      return NextResponse.json(
        { success: false, message: "This booking is already paid." },
        { status: 409 }
      );
    }

    const existingPayment = await Payment.findOne({
      booking: bookingId,
      user: mongoUser._id,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      transactionId: { $exists: true, $ne: "" },
    }).sort({ createdAt: -1 });

    if (existingPayment?.transactionId) {
      const existingIntent = await retrievePaymentIntent(existingPayment.transactionId);
      if (
        existingIntent.client_secret &&
        !["canceled", "succeeded"].includes(existingIntent.status)
      ) {
        return NextResponse.json(
          {
            success: true,
            message: "Stripe payment intent reused",
            data: {
              paymentId: existingPayment._id,
              clientSecret: existingIntent.client_secret,
              paymentIntentId: existingIntent.id,
            },
          },
          { status: 200 }
        );
      }
    }

    const amount = booking.totalAmount;
    const paymentIntent = await createPaymentIntent({
      amount,
      bookingId,
      userId: String(mongoUser._id),
      description: `Booking ${booking.bookingNumber}`,
    });

    const payment = await Payment.create({
      booking: bookingId,
      user: mongoUser._id,
      amount,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      transactionId: paymentIntent.id,
      gatewayResponse: { clientSecret: paymentIntent.client_secret },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Stripe payment intent created",
        data: {
          paymentId: payment._id,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Stripe initiate error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/payments/stripe — confirm after frontend completes payment
export async function PUT(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();
    const mongoUser = await resolveMongoUser(session);

    const { paymentId, paymentIntentId } = await req.json() as {
      paymentId: string;
      paymentIntentId: string;
    };

    if (!paymentId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, message: "paymentId and paymentIntentId are required" },
        { status: 400 }
      );
    }

    const existingPayment = await Payment.findOne({
      _id: paymentId,
      user: mongoUser._id,
      paymentMethod: "stripe",
      transactionId: paymentIntentId,
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    if (existingPayment.paymentStatus === "paid") {
      return NextResponse.json(
        { success: true, message: "Payment already confirmed", data: { payment: existingPayment } },
        { status: 200 }
      );
    }

    const intent = await retrievePaymentIntent(paymentIntentId);
    if (intent.status !== "succeeded") {
      if (["canceled", "requires_payment_method"].includes(intent.status)) {
        await Payment.findByIdAndUpdate(paymentId, {
          paymentStatus: "failed",
          gatewayResponse: intent,
        });
      }
      return NextResponse.json(
        { success: false, message: `Stripe payment not completed. Current status: ${intent.status}` },
        { status: 400 }
      );
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { paymentStatus: "paid", paymentDate: new Date(), gatewayResponse: intent },
      { new: true }
    );
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment record not found" }, { status: 404 });
    }

    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "paid" });

    // Create invoice if one doesn't already exist
    const existingInvoice = await Invoice.findOne({ payment: payment._id });
    if (!existingInvoice) {
      const invoiceNumber = generateInvoiceNumber();
      await Invoice.create({
        payment: payment._id,
        booking: payment.booking,
        user: payment.user,
        invoiceNumber,
        totalAmount: payment.amount,
        subtotal: payment.amount,
        tax: 0,
        discount: 0,
        items: [{ description: "Tour Package Booking", quantity: 1, unitPrice: payment.amount, total: payment.amount }],
        status: "paid",
      });

      await Notification.create({
        user: payment.user,
        type: "payment_received",
        title: "Payment Confirmed",
        message: `Your payment of $${payment.amount} via Stripe has been confirmed.`,
        relatedId: payment._id,
        relatedModel: "Payment",
      });

      const user = await User.findById(payment.user);
      if (user) {
        sendMail({
          to: user.email,
          subject: `Payment Receipt - ${invoiceNumber}`,
          html: paymentReceiptTemplate(
            user.firstName,
            invoiceNumber,
            payment.amount,
            "Stripe",
            new Date().toLocaleDateString()
          ),
          userId: String(user._id),
          templateType: "payment_receipt",
        }).catch(console.error);
      }
    }

    return NextResponse.json(
      { success: true, message: "Payment confirmed", data: { payment } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stripe confirm error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
