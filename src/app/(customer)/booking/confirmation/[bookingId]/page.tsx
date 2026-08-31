"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import StripePayment from "@/components/payments/StripePayment";
import {
  CheckmarkCircle01Icon,
  Calendar03Icon,
  UserGroupIcon,
  CreditCardIcon,
  ArrowRight01Icon,
  Clock01Icon,
} from "hugeicons-react";

interface Booking {
  _id: string;
  bookingNumber: string;
  status: string;
  paymentStatus: string;
  travelDate: string;
  numberOfTravelers: number;
  totalAmount: number;
  package: { title: string; duration: { days: number; nights: number } };
}

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"confirm" | "pay" | "done">("confirm");

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`, { credentials: "include" })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setBooking(j.data.booking);
          if (j.data.booking.paymentStatus === "paid") {
            setStep("done");
          } else if (searchParams.get("step") === "pay") {
            setStep("pay");
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookingId, searchParams]);

  const stepIndex = (s: string) => ["confirm", "pay", "done"].indexOf(s);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-200" />)}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-gray-500">Booking not found.</p>
        <Link href="/packages" className="mt-3 text-sm text-blue-600 hover:underline">Browse packages</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 space-y-6">

      {/* Step indicator */}
      <div className="flex items-center gap-3 text-sm">
        {[
          { key: "confirm", label: "Booking" },
          { key: "pay",     label: "Payment" },
          { key: "done",    label: "Done" },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-3">
            {i > 0 && <div className="h-px w-8 bg-gray-200" />}
            <div className={`flex items-center gap-2 font-medium ${
              step === s.key ? "text-blue-700"
              : stepIndex(step) > i ? "text-green-600"
              : "text-gray-400"
            }`}>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === s.key ? "bg-blue-700 text-white"
                : stepIndex(step) > i ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
              }`}>
                {stepIndex(step) > i ? "✓" : i + 1}
              </div>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Step 1: Booking confirmed ── */}
      {step === "confirm" && (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckmarkCircle01Icon size={36} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Received!</h1>
            <p className="mt-2 text-gray-500">
              Your booking is pending staff approval. Complete payment to secure your spot.
            </p>
            <div className="mt-4 inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              #{booking.bookingNumber}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-semibold text-gray-900">Booking Summary</h2>
            <div className="space-y-3 text-sm">
              <Row label="Package" value={booking.package.title} />
              <Row
                label="Travel Date"
                value={new Date(booking.travelDate).toLocaleDateString("en-US", {
                  weekday: "short", day: "numeric", month: "long", year: "numeric",
                })}
                icon={<Calendar03Icon size={14} />}
              />
              <Row
                label="Duration"
                value={`${booking.package.duration.days}D / ${booking.package.duration.nights}N`}
                icon={<Clock01Icon size={14} />}
              />
              <Row
                label="Travelers"
                value={String(booking.numberOfTravelers)}
                icon={<UserGroupIcon size={14} />}
              />
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-blue-700">${booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("pay")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <CreditCardIcon size={16} /> Pay Now with Card
            </button>
            <Link
              href="/dashboard/bookings"
              className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Pay Later
            </Link>
          </div>
        </>
      )}

      {/* ── Step 2: Stripe payment ── */}
      {step === "pay" && (
        <>
          <StripePayment
            bookingId={booking._id}
            amount={booking.totalAmount}
            onSuccess={() => {
              setBooking({ ...booking, paymentStatus: "paid" });
              setStep("done");
            }}
            onCancel={() => setStep("confirm")}
          />
        </>
      )}

      {/* ── Step 3: Done ── */}
      {step === "done" && (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckmarkCircle01Icon size={36} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Confirmed!</h1>
            <p className="mt-2 text-gray-500">
              Your payment was successful. Our staff will confirm your booking shortly.
              Check your email for a receipt.
            </p>
            <div className="mt-4 inline-block rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              #{booking.bookingNumber}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/bookings"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              View My Bookings <ArrowRight01Icon size={15} />
            </Link>
            <Link
              href="/packages"
              className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Browse More Packages
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-gray-600">
      <span className="flex items-center gap-1.5">{icon}{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
