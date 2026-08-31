"use client";

import { useEffect, useState } from "react";
import { CreditCardIcon } from "hugeicons-react";

interface Payment {
  _id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  booking: { bookingNumber: string };
  user: { name?: string; email: string };
}

const STATUS_STYLES: Record<string, string> = {
  paid:     "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  failed:   "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

function getName(u?: { name?: string; email: string }): string {
  return u?.name ?? u?.email ?? "—";
}

export default function StaffPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const q = filter !== "all" ? `?status=${filter}&limit=50` : "?limit=50";
    fetch(`/api/payments${q}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setPayments(j.data.payments); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  async function verifyCash(id: string, bookingId: string, amount: number) {
    setVerifying(id);
    await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "verify_cash", bookingId, amount }),
    });
    setPayments((prev) => prev.map((p) => p._id === id ? { ...p, paymentStatus: "paid" } : p));
    setVerifying(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">View and verify transactions</p>
      </div>

      <div className="mb-5 flex gap-2">
        {["all", "pending", "paid", "refunded"].map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${filter === t ? "bg-purple-700 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center py-14">
            <CreditCardIcon size={48} className="mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">No payments found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Booking</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Method</th>
                <th className="px-5 py-3 text-left">Amount</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-900">#{p.booking?.bookingNumber ?? "—"}</td>
                  <td className="px-5 py-3 max-w-[130px] truncate text-gray-600">{getName(p.user)}</td>
                  <td className="px-5 py-3 capitalize text-gray-600">{p.paymentMethod}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">${p.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[p.paymentStatus]}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    {p.paymentStatus === "pending" && p.paymentMethod === "cash" && (
                      <button
                        onClick={() => verifyCash(p._id, p.booking?.bookingNumber, p.amount)}
                        disabled={verifying === p._id}
                        className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        {verifying === p._id ? "…" : "Verify Cash"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
