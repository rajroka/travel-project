import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { Booking } from "@/lib/db/models/Booking";
import { Invoice } from "@/lib/db/models/Invoice";
import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { requireSession } from "@/lib/auth/session";
import { initiatePaymentSchema } from "@/lib/validations/payment";
import { generateInvoiceNumber } from "@/lib/auth/auth";
import { sendMail, paymentReceiptTemplate } from "@/lib/email/mailer";
import axios from "axios";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? "";

async function getPayPalAccessToken(): Promise<string> {
  const res = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_CLIENT_SECRET },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return res.data.access_token as string;
}

// POST /api/payments/paypal â€” create PayPal order
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

    const accessToken = await getPayPalAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const orderRes = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: booking.bookingNumber,
            amount: { currency_code: "USD", value: amount.toFixed(2) },
          },
        ],
        application_context: {
          return_url: `${appUrl}/payment/paypal/verify?bookingId=${bookingId}`,
          cancel_url: `${appUrl}/payment/cancel`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const orderId: string = orderRes.data.id;
    const approvalUrl: string =
      orderRes.data.links.find((l: { rel: string }) => l.rel === "approve")?.href ?? "";

    const payment = await Payment.create({
      booking: bookingId,
      user: session.userId,
      amount,
      paymentMethod: "paypal",
      paymentStatus: "pending",
      transactionId: orderId,
      gatewayResponse: { orderId, approvalUrl },
    });

    return NextResponse.json(
      {
        success: true,
        message: "PayPal order created",
        data: { paymentId: payment._id, orderId, approvalUrl },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("PayPal initiate error:", err);
    return NextResponse.json({ success: false, message: "PayPal payment initiation failed" }, { status: 500 });
  }
}

// PUT /api/payments/paypal â€” capture PayPal order after approval
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const { paymentId, orderId } = await req.json() as { paymentId: string; orderId: string };
    if (!paymentId || !orderId) {
      return NextResponse.json(
        { success: false, message: "paymentId and orderId are required" },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const captureRes = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );

    if (captureRes.data.status !== "COMPLETED") {
      await Payment.findByIdAndUpdate(paymentId, { paymentStatus: "failed" });
      return NextResponse.json({ success: false, message: "PayPal capture failed" }, { status: 400 });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { paymentStatus: "paid", paymentDate: new Date(), gatewayResponse: captureRes.data },
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
      message: `Your PayPal payment of $${payment.amount} has been confirmed.`,
      relatedId: payment._id,
      relatedModel: "Payment",
    });

    const user = await User.findById(payment.user);
    if (user) {
      sendMail({
        to: user.email,
        subject: `Payment Receipt - ${invoiceNumber}`,
        html: paymentReceiptTemplate(user.firstName, invoiceNumber, payment.amount, "PayPal", new Date().toLocaleDateString()),
        userId: String(user._id),
        templateType: "payment_receipt",
      }).catch(console.error);
    }

    return NextResponse.json(
      { success: true, message: "PayPal payment captured", data: { payment, invoice } },
      { status: 200 }
    );
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json({ success: false, message: "PayPal capture failed" }, { status: 500 });
  }
}
