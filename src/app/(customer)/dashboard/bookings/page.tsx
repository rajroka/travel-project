"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar03Icon, Clock01Icon } from "hugeicons-react";

interface Booking {
  _id: string;
  bookingNumber: string;
  travelDate: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: string;
  numberOfTravelers: number;
  totalAmount: number;
  package: { title: string; duration: { days: number; nights: number } };
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = filter !== "all" ? `?status=${filter}` : "";
    fetch(`/api/bookings${q}`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setBookings(json.data.bookings); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const tabs = ["all", "pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Bookings</h1>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setFilter(t); setLoading(true); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition whitespace-nowrap ${
              filter === t ? "bg-blue-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-14 text-center shadow-sm">
          <Calendar03Icon size={48} className="mb-3 text-gray-300" />
          <p className="text-gray-400">No bookings found.</p>
          <Link href="/packages" className="mt-3 text-sm text-blue-600 hover:underline">Browse packages â†’</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.package.title}</h3>
                  <p className="text-xs text-gray-400">#{b.bookingNumber}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar03Icon size={16} className="text-blue-400" />{new Date(b.travelDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock01Icon size={16} className="text-blue-400" />{b.package.duration.days}D/{b.package.duration.nights}N</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-gray-900">${b.totalAmount}</span>
                <Link href={`/bookings/${b._id}`} className="text-sm text-blue-600 hover:underline">Details â†’</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
