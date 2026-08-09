import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { Booking } from "@/lib/db/models/Booking";
import { Invoice } from "@/lib/db/models/Invoice";
import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { requireSession } from "@/lib/auth/session";
import { initiatePaymentSchema } from "@/lib/validations/payment";
import { createPaymentIntent, retrievePaymentIntent } from "@/lib/payments/stripe";
import { generateInvoiceNumber } from "@/lib/auth/auth";
import { sendMail, paymentReceiptTemplate } from "@/lib/email/mailer";

// POST /api/payments/stripe â€” create Stripe PaymentIntent
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

    const { bookingId, amount } = parsed.data;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }
    if (String(booking.user) !== session.userId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const paymentIntent = await createPaymentIntent({
      amount,
      bookingId,
      userId: session.userId,
      description: `Booking ${booking.bookingNumber}`,
    });

    const payment = await Payment.create({
      booking: bookingId,
      user: session.userId,
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

// PUT /api/payments/stripe â€” confirm after frontend completes payment
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const { paymentId, paymentIntentId } = await req.json() as { paymentId: string; paymentIntentId: string };

    const intent = await retrievePaymentIntent(paymentIntentId);
    if (intent.status !== "succeeded") {
      await Payment.findByIdAndUpdate(paymentId, { paymentStatus: "failed" });
      return NextResponse.json(
        { success: false, message: "Stripe payment not completed" },
        { status: 400 }
      );
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { paymentStatus: "paid", paymentDate: new Date() },
      { new: true }
    );
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment record not found" }, { status: 404 });
    }

    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "paid" });

    const invoiceNumber = generateInvoiceNumber();
    const invoice = await Invoice.create({
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
        html: paymentReceiptTemplate(user.firstName, invoiceNumber, payment.amount, "Stripe", new Date().toLocaleDateString()),
        userId: String(user._id),
        templateType: "payment_receipt",
      }).catch(console.error);
    }

    return NextResponse.json(
      { success: true, message: "Payment confirmed", data: { payment, invoice } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stripe confirm error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
