"use client";

import { useEffect, useState } from "react";
import { Calendar03Icon } from "hugeicons-react";

interface Booking {
  _id: string;
  bookingNumber: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: string;
  totalAmount: number;
  travelDate: string;
  createdAt: string;
  user: { name?: string; email: string; phone?: string };
  package: { title: string; duration: { days: number } };
}

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

function getName(u?: { name?: string; email: string }): string {
  return u?.name ?? u?.email ?? "—";
}

export default function StaffBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  function fetch_bookings(f: string) {
    setLoading(true);
    const q = f !== "all" ? `?status=${f}&limit=50` : "?limit=50";
    fetch(`/api/bookings${q}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setBookings(j.data.bookings); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetch_bookings(filter); }, [filter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    fetch_bookings(filter);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage customer bookings</p>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize whitespace-nowrap transition ${filter === t ? "bg-purple-700 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Calendar03Icon size={48} className="mb-3 text-gray-300" />
            <p className="text-gray-400">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left">Booking</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Package</th>
                  <th className="px-5 py-3 text-left">Travel Date</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-900">#{b.bookingNumber}</td>
                    <td className="px-5 py-3 max-w-[140px] truncate text-gray-600">{getName(b.user)}</td>
                    <td className="px-5 py-3 max-w-[160px] truncate text-gray-600">{b.package?.title}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(b.travelDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">${b.totalAmount}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {b.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(b._id, "confirmed")} disabled={updating === b._id}
                              className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition">
                              {updating === b._id ? "…" : "Approve"}
                            </button>
                            <button onClick={() => updateStatus(b._id, "cancelled")} disabled={updating === b._id}
                              className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition">
                              Reject
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button onClick={() => updateStatus(b._id, "completed")} disabled={updating === b._id}
                            className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
                            {updating === b._id ? "…" : "Complete"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
