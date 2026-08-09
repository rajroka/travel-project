import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { Booking } from "@/lib/db/models/Booking";
import { Invoice } from "@/lib/db/models/Invoice";
import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { requireSession } from "@/lib/auth/session";
import { initiatePaymentSchema, verifyPaymentSchema } from "@/lib/validations/payment";
import { buildEsewaPaymentData, verifyEsewaSignature, ESEWA_PAYMENT_URL } from "@/lib/payments/esewa";
import { generateInvoiceNumber } from "@/lib/auth/auth";
import { sendMail, paymentReceiptTemplate } from "@/lib/email/mailer";

// POST /api/payments/esewa â€” initiate eSewa payment
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

    // Create a pending payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: session.userId,
      amount,
      paymentMethod: "esewa",
      paymentStatus: "pending",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const esewaData = buildEsewaPaymentData({
      amount,
      productCode: booking.bookingNumber,
      successUrl: `${appUrl}/payment/success?paymentId=${payment._id}&method=esewa`,
      failureUrl: `${appUrl}/payment/failure?paymentId=${payment._id}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "eSewa payment initiated",
        data: { paymentId: payment._id, esewaUrl: ESEWA_PAYMENT_URL, esewaData },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("eSewa initiate error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/payments/esewa â€” verify eSewa callback
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { paymentId, transactionId, totalAmount, transactionUuid, signedFieldNames, signature } =
      body as Record<string, string>;

    const isValid = verifyEsewaSignature(
      Number(totalAmount),
      transactionUuid,
      signedFieldNames,
      signature
    );

    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid eSewa signature" }, { status: 400 });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        paymentStatus: "paid",
        transactionId,
        paymentDate: new Date(),
        gatewayResponse: body,
      },
      { new: true }
    ).populate("booking");

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    // Update booking payment status
    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "paid" });

    // Generate invoice
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

    // Notification
    await Notification.create({
      user: payment.user,
      type: "payment_received",
      title: "Payment Confirmed",
      message: `Your payment of $${payment.amount} via eSewa has been confirmed.`,
      relatedId: payment._id,
      relatedModel: "Payment",
    });

    // Email receipt
    const user = await User.findById(payment.user);
    if (user) {
      sendMail({
        to: user.email,
        subject: `Payment Receipt - ${invoiceNumber}`,
        html: paymentReceiptTemplate(user.firstName, invoiceNumber, payment.amount, "eSewa", new Date().toLocaleDateString()),
        userId: String(user._id),
        templateType: "payment_receipt",
      }).catch(console.error);
    }

    return NextResponse.json(
      { success: true, message: "Payment verified", data: { payment, invoice } },
      { status: 200 }
    );
  } catch (error) {
    console.error("eSewa verify error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
