import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { Booking } from "@/lib/db/models/Booking";
import { Invoice } from "@/lib/db/models/Invoice";
import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { stripe } from "@/lib/payments/stripe";
import { generateInvoiceNumber } from "@/lib/auth/auth";
import { sendMail, paymentReceiptTemplate } from "@/lib/email/mailer";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

/**
 * POST /api/payments/webhook
 * Stripe sends signed events here. We verify the signature, then handle
 * payment_intent.succeeded and payment_intent.payment_failed.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Webhook signature verification failed:", e.message);
    return NextResponse.json({ error: `Webhook Error: ${e.message}` }, { status: 400 });
  }

  await connectDB();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(intent);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(intent);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    // Return 200 so Stripe doesn't retry — the error is logged
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const payment = await Payment.findOneAndUpdate(
    { transactionId: intent.id },
    { paymentStatus: "paid", paymentDate: new Date() },
    { new: true }
  );
  if (!payment) return;

  // Mark booking as paid
  await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "paid" });

  // Create invoice if one doesn't already exist
  const exists = await Invoice.findOne({ payment: payment._id });
  if (!exists) {
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
      items: [
        {
          description: "Tour Package Booking",
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        },
      ],
      status: "paid",
    });
  }

  // In-app notification
  await Notification.create({
    user: payment.user,
    type: "payment_received",
    title: "Payment Confirmed",
    message: `Your payment of $${payment.amount} via Stripe has been confirmed.`,
    relatedId: payment._id,
    relatedModel: "Payment",
  });

  // Email receipt
  const user = await User.findById(payment.user);
  if (user) {
    const invoiceNumber = generateInvoiceNumber();
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

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  await Payment.findOneAndUpdate(
    { transactionId: intent.id },
    { paymentStatus: "failed" }
  );
}

async function handleRefund(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;
  await Payment.findOneAndUpdate(
    { transactionId: charge.payment_intent as string },
    { paymentStatus: "refunded" }
  );
}
