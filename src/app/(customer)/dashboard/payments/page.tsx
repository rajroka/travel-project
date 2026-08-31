"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCardIcon, Download01Icon, ArrowRight01Icon } from "hugeicons-react";

interface Payment {
  _id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentDate?: string;
  createdAt: string;
  booking: { _id: string; bookingNumber: string; travelDate: string };
}

const STATUS_STYLES: Record<string, string> = {
  paid:     "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  failed:   "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  // map paymentId → invoiceId for download
  const [invoiceMap, setInvoiceMap] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/payments", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/invoices", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([pJson, iJson]) => {
        if (pJson.success) setPayments(pJson.data.payments);
        if (iJson.success) {
          const map: Record<string, string> = {};
          (iJson.data.invoices as Array<{ _id: string; payment: string | { _id: string } }>).forEach((inv) => {
            const pid = typeof inv.payment === "string" ? inv.payment : inv.payment?._id;
            if (pid) map[pid] = inv._id;
          });
          setInvoiceMap(map);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Payment History</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
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
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p._id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    #{p.booking?.bookingNumber ?? "—"}
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
                    <div className="flex items-center gap-2">
                      {/* Download invoice if paid */}
                      {p.paymentStatus === "paid" && invoiceMap[p._id] && (
                        <Link
                          href={`/dashboard/invoices/${invoiceMap[p._id]}`}
                          className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                          title="View invoice"
                        >
                          <Download01Icon size={13} /> Invoice
                        </Link>
                      )}
                      {/* Pay now if pending */}
                      {p.paymentStatus === "pending" && p.booking?._id && (
                        <Link
                          href={`/booking/confirmation/${p.booking._id}?step=pay`}
                          className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-amber-600"
                        >
                          Pay Now <ArrowRight01Icon size={12} />
                        </Link>
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
  );
}
