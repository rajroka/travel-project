import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

export interface StripePaymentIntentParams {
  amount: number; // in USD (dollars) — will be converted to cents internally
  currency?: string;
  bookingId: string;
  userId: string;
  description?: string;
}

export async function createPaymentIntent(
  params: StripePaymentIntentParams
): Promise<Stripe.PaymentIntent> {
  const amountInCents = Math.round(params.amount * 100);
  if (!Number.isFinite(amountInCents) || amountInCents < 100) {
    throw new Error("Stripe payment amount must be at least 1.00");
  }

  return stripe.paymentIntents.create({
    amount: amountInCents, // Stripe requires cents: $450 → 45000
    currency: params.currency || "usd",
    metadata: {
      bookingId: params.bookingId,
      userId: params.userId,
    },
    description: params.description || "Tour booking payment",
    automatic_payment_methods: { enabled: true },
  });
}

export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number // in USD (dollars) — converted to cents internally
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount ? { amount: Math.round(amount * 100) } : {}),
  });
}

export { stripe };
