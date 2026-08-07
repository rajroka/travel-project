import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { Booking } from "@/lib/db/models/Booking";
import { Invoice } from "@/lib/db/models/Invoice";
import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { requireSession } from "@/lib/auth/session";
import { initiatePaymentSchema } from "@/lib/validations/payment";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "@/lib/payments/khalti";
import { generateInvoiceNumber } from "@/lib/auth/auth";
import { sendMail, paymentReceiptTemplate } from "@/lib/email/mailer";

// POST /api/payments/khalti â€” initiate Khalti payment
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

    const booking = await Booking.findById(bookingId).populate("package");
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }
    if (String(booking.user) !== session.userId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const payment = await Payment.create({
      booking: bookingId,
      user: session.userId,
      amount,
      paymentMethod: "khalti",
      paymentStatus: "pending",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pkg = booking.package as { title: string } | null;

    const khaltiData = await initiateKhaltiPayment({
      amount: amount * 100, // convert to paisa
      purchaseOrderId: booking.bookingNumber,
      purchaseOrderName: pkg?.title ?? "Tour Package",
      customerInfo: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
      },
      returnUrl: `${appUrl}/payment/khalti/verify?paymentId=${payment._id}`,
      websiteUrl: appUrl,
    });

    // Store pidx for later verification
    await Payment.findByIdAndUpdate(payment._id, {
      transactionId: khaltiData.pidx,
      gatewayResponse: khaltiData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Khalti payment initiated",
        data: { paymentId: payment._id, paymentUrl: khaltiData.paymentUrl, pidx: khaltiData.pidx },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Khalti initiate error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/payments/khalti â€” verify Khalti callback
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const { paymentId, pidx } = await req.json() as { paymentId: string; pidx: string };
    if (!paymentId || !pidx) {
      return NextResponse.json(
        { success: false, message: "paymentId and pidx are required" },
        { status: 400 }
      );
    }

    const verificationResult = await verifyKhaltiPayment(pidx);

    if (verificationResult.status !== "Completed") {
      await Payment.findByIdAndUpdate(paymentId, { paymentStatus: "failed", gatewayResponse: verificationResult });
      return NextResponse.json(
        { success: false, message: "Payment not completed", data: verificationResult },
        { status: 400 }
      );
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        paymentStatus: "paid",
        paymentDate: new Date(),
        gatewayResponse: verificationResult,
      },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
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
      message: `Your payment of $${payment.amount} via Khalti has been confirmed.`,
      relatedId: payment._id,
      relatedModel: "Payment",
    });

    const user = await User.findById(payment.user);
    if (user) {
      sendMail({
        to: user.email,
        subject: `Payment Receipt - ${invoiceNumber}`,
        html: paymentReceiptTemplate(user.firstName, invoiceNumber, payment.amount, "Khalti", new Date().toLocaleDateString()),
        userId: String(user._id),
        templateType: "payment_receipt",
      }).catch(console.error);
    }

    return NextResponse.json(
      { success: true, message: "Payment verified", data: { payment, invoice } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Khalti verify error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
