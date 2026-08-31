"use client";

import { useEffect, useState } from "react";
import { UserGroupIcon } from "hugeicons-react";

interface CustomersReport {
  summary: { totalCustomers: number; activeCustomers: number; inactiveCustomers: number; newThisMonth: number };
  topCustomers: Array<{ user: { firstName?: string; name?: string; email: string }; bookingCount: number; totalSpent: number }>;
}

export default function CustomersReportPage() {
  const [data, setData] = useState<CustomersReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/customers", { credentials: "include" })
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Report</h1>
        <p className="mt-1 text-sm text-gray-500">Customer statistics and top spenders</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />) : [
          { label: "Total Customers", value: data?.summary.totalCustomers ?? 0 },
          { label: "Active", value: data?.summary.activeCustomers ?? 0 },
          { label: "Inactive", value: data?.summary.inactiveCustomers ?? 0 },
          { label: "New This Month", value: data?.summary.newThisMonth ?? 0 },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Top Customers by Spend</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : (data?.topCustomers ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <UserGroupIcon size={40} className="mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No customer data yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 bg-gray-50 text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Bookings</th>
                  <th className="px-5 py-3 text-left">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.topCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {c.user?.name ?? c.user?.firstName ?? c.user?.email}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.bookingCount}</td>
                    <td className="px-5 py-3 font-bold text-gray-900">${c.totalSpent.toLocaleString()}</td>
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
