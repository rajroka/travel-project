"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCardIcon, Download01Icon } from "hugeicons-react";

interface Payment {
  _id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentDate?: string;
  createdAt: string;
  booking: { bookingNumber: string; travelDate: string };
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setPayments(json.data.payments); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Payment History</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-14 text-center shadow-sm">
          <CreditCardIcon size={48} className="mb-3 text-gray-300" />
          <p className="text-gray-400">No payment records found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Booking</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Method</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Amount</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    #{p.booking?.bookingNumber ?? "â€”"}
                  </td>
                  <td className="px-5 py-3 capitalize text-gray-600">{p.paymentMethod}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">${p.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[p.paymentStatus]}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(p.paymentDate ?? p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/api/invoices?paymentId=${p._id}`} className="text-blue-600 hover:text-blue-800" title="Download invoice">
                      <Download01Icon size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
