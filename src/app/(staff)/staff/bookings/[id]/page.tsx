"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar03Icon,
  UserGroupIcon,
  MapPinIcon,
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Clock01Icon,
} from "hugeicons-react";
import { formatUserName } from "@/lib/utils/formatters";

interface Booking {
  _id: string;
  bookingNumber: string;
  status: string;
  paymentStatus: string;
  travelDate: string;
  numberOfTravelers: number;
  totalAmount: number;
  specialRequests?: string;
  createdAt: string;
  user: { firstName: string; lastName?: string; email: string; phone?: string };
  package: { title: string; slug: string; duration: { days: number; nights: number }; price: number };
}

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  unpaid:   "bg-red-100 text-red-700",
  paid:     "bg-green-100 text-green-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function StaffBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/bookings/${id}`, { credentials: "include" })
      .then(r => r.json())
      .then(j => { if (j.success) setBooking(j.data.booking); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    if (!booking) return;
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const j = await res.json() as { success: boolean; message?: string; data?: { booking: Booking } };
      if (j.success) setBooking(j.data!.booking);
      else setError(j.message ?? "Failed to update status.");
    } catch {
      setError("Network error.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <p className="text-gray-500">Booking not found.</p>
        <Link href="/staff/bookings" className="text-sm text-blue-600 hover:underline">← All Bookings</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
        <ArrowLeft01Icon size={16} /> All Bookings
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">#{booking.bookingNumber}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Created {new Date(booking.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[booking.status] ?? "bg-gray-100 text-gray-600"}`}>
            {booking.status}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${PAYMENT_COLORS[booking.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-5 lg:col-span-2">
          {/* Package */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Package Details</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <MapPinIcon size={15} className="text-blue-500 flex-shrink-0" />
                <span className="font-medium">{booking.package.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock01Icon size={15} className="text-blue-500 flex-shrink-0" />
                {booking.package.duration.days}D / {booking.package.duration.nights}N
              </div>
              <div className="flex items-center gap-2">
                <Calendar03Icon size={15} className="text-blue-500 flex-shrink-0" />
                {new Date(booking.travelDate).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2">
                <UserGroupIcon size={15} className="text-blue-500 flex-shrink-0" />
                {booking.numberOfTravelers} {booking.numberOfTravelers === 1 ? "traveler" : "travelers"}
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Customer</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-medium">{formatUserName(booking.user)}</p>
              <p className="text-gray-500">{booking.user.email}</p>
              {booking.user.phone && <p className="text-gray-500">{booking.user.phone}</p>}
            </div>
          </div>

          {/* Special requests */}
          {booking.specialRequests && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-900">Special Requests</h2>
              <p className="text-sm text-gray-600 leading-6">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Payment summary */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Payment</h2>
            <div className="text-2xl font-bold text-blue-700">${booking.totalAmount}</div>
            <div className="mt-1 text-xs text-gray-400">Total amount</div>
          </div>

          {/* Status actions */}
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-900">Update Status</h2>
              <div className="space-y-2">
                {booking.status === "pending" && (
                  <button
                    onClick={() => updateStatus("confirmed")}
                    disabled={updating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckmarkCircle01Icon size={15} /> Confirm Booking
                  </button>
                )}
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus("completed")}
                    disabled={updating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    <CheckmarkCircle01Icon size={15} /> Mark Completed
                  </button>
                )}
                <button
                  onClick={() => updateStatus("cancelled")}
                  disabled={updating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Cancel01Icon size={15} /> Cancel Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
