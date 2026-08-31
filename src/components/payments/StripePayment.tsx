"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCardIcon } from "hugeicons-react";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const stripeConfigurationError = stripePromise
  ? ""
  : "Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.";

// ── inner form (must be inside <Elements>) ────────────────────────────────
function CheckoutForm({
  paymentId,
  amount,
  onSuccess,
  onError,
}: {
  paymentId: string;
  amount: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // return_url is required by Stripe but we handle success inline
        return_url: `${window.location.origin}/dashboard/payments`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Payment failed.");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Confirm on our backend
      try {
        const res = await fetch("/api/payments/stripe", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ paymentId, paymentIntentId: paymentIntent.id }),
        });
        const json = await res.json() as { success: boolean; message?: string };
        if (json.success) {
          onSuccess();
        } else {
          onError(json.message ?? "Could not confirm payment.");
        }
      } catch {
        onError("Network error confirming payment.");
      }
    }

    setProcessing(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Processing…
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>
    </form>
  );
}

// ── public wrapper ────────────────────────────────────────────────────────
interface Props {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StripePayment({ bookingId, amount, onSuccess, onCancel }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(stripePromise));
  const [error, setError] = useState(stripeConfigurationError);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!stripePromise) {
      return;
    }

    const controller = new AbortController();
    let active = true;

    fetch("/api/payments/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: controller.signal,
      body: JSON.stringify({ bookingId, amount }),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.message ?? "Could not initiate payment.");
        return json;
      })
      .then((j: { success: boolean; data?: { clientSecret: string; paymentId: string }; message?: string }) => {
        if (!active) return;
        if (j.success && j.data) {
          setClientSecret(j.data.clientSecret);
          setPaymentId(j.data.paymentId);
        } else {
          setError(j.message ?? "Could not initiate payment.");
        }
      })
      .catch((err: Error) => {
        if (active && err.name !== "AbortError") {
          setError(err.message || "Network error. Please try again.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [bookingId, amount]);

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-green-50 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CreditCardIcon size={28} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-green-800">Payment Successful!</h3>
        <p className="text-sm text-green-700">
          Your payment of ${amount.toFixed(2)} has been confirmed. Check your email for a receipt.
        </p>
        {onSuccess && (
          <button
            onClick={onSuccess}
            className="mt-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Continue
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <CreditCardIcon size={22} className="text-blue-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Pay with Card</h3>
          <p className="text-xs text-gray-500">Secured by Stripe · SSL encrypted</p>
        </div>
        <span className="ml-auto text-xl font-bold text-gray-900">${amount.toFixed(2)}</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {clientSecret && paymentId && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#1d4ed8",
                borderRadius: "12px",
                fontFamily: "inherit",
              },
            },
          }}
        >
          <CheckoutForm
            paymentId={paymentId}
            amount={amount}
            onSuccess={() => {
              setPaid(true);
              onSuccess?.();
            }}
            onError={setError}
          />
        </Elements>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
