"use client";

import { useEffect, useState } from "react";
import { Calendar03Icon } from "hugeicons-react";

interface BookingsReport {
  statusBreakdown: Array<{ _id: string; count: number; revenue: number }>;
  summary: { total: number; totalRevenue: number; avgAmount: number };
  recentBookings: Array<{ _id: string; bookingNumber: string; status: string; totalAmount: number; createdAt: string; user: { name?: string; email: string }; package: { title: string } }>;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function BookingsReportPage() {
  const [data, setData] = useState<BookingsReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/bookings", { credentials: "include" })
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings Report</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of all booking activity</p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />) : (
          <>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{data?.summary.total ?? 0}</p>
              <p className="mt-0.5 text-sm text-gray-500">Total Bookings</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">${(data?.summary.totalRevenue ?? 0).toLocaleString()}</p>
              <p className="mt-0.5 text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">${(data?.summary.avgAmount ?? 0).toFixed(0)}</p>
              <p className="mt-0.5 text-sm text-gray-500">Avg. Booking Value</p>
            </div>
          </>
        )}
      </div>

      {/* Status breakdown */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />) :
          (data?.statusBreakdown ?? []).map(s => (
            <div key={s._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[s._id] ?? "bg-gray-100 text-gray-600"}`}>{s._id}</span>
              <p className="mt-3 text-xl font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-400">${s.revenue.toLocaleString()} revenue</p>
            </div>
          ))
        }
      </div>

      {/* Recent */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 bg-gray-50 text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left">Booking</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Package</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.recentBookings ?? []).map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">#{b.bookingNumber}</td>
                    <td className="px-5 py-3 truncate max-w-[130px] text-gray-600">{b.user?.name ?? b.user?.email}</td>
                    <td className="px-5 py-3 truncate max-w-[150px] text-gray-600">{b.package?.title}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">${b.totalAmount}</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[b.status] ?? ""}`}>{b.status}</span></td>
                    <td className="px-5 py-3 text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
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
