"use client";

import { useEffect, useState } from "react";
import { DollarCircleIcon, BarChartIcon } from "hugeicons-react";

interface RevenueData {
  revenueByPeriod: Array<{ _id: { month?: number; year?: number; day?: number }; revenue: number; count: number }>;
  summary: { totalRevenue: number; totalTransactions: number; totalRefunds: number; refundCount: number; netRevenue: number };
  methodBreakdown: Array<{ _id: string; total: number; count: number }>;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function RevenueReportPage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const year = new Date().getFullYear();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/revenue?period=${period}&year=${year}`, { credentials: "include" })
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const maxRevenue = Math.max(...(data?.revenueByPeriod ?? []).map(r => r.revenue), 1);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Report</h1>
          <p className="mt-1 text-sm text-gray-500">Financial overview and trends</p>
        </div>
        <div className="flex gap-2">
          {["daily", "monthly", "yearly"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                period === p ? "bg-blue-700 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: `$${(data?.summary.totalRevenue ?? 0).toLocaleString()}`, icon: <DollarCircleIcon size={22} className="text-green-600" />, color: "bg-green-50" },
          { label: "Net Revenue", value: `$${(data?.summary.netRevenue ?? 0).toLocaleString()}`, icon: <BarChartIcon size={22} className="text-blue-600" />, color: "bg-blue-50" },
          { label: "Transactions", value: data?.summary.totalTransactions ?? 0, icon: <DollarCircleIcon size={22} className="text-purple-600" />, color: "bg-purple-50" },
          { label: "Total Refunds", value: `$${(data?.summary.totalRefunds ?? 0).toLocaleString()}`, icon: <DollarCircleIcon size={22} className="text-red-500" />, color: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900 capitalize">{period} Breakdown</h2>
          {loading ? (
            <div className="flex items-end gap-2 h-40">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex-1 animate-pulse rounded-t bg-gray-100" style={{ height: `${30 + i * 12}%` }} />)}
            </div>
          ) : (data?.revenueByPeriod ?? []).length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">No data for this period</div>
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {data?.revenueByPeriod.map((r, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-1">
                  <div
                    className="relative w-full rounded-t-lg bg-blue-500 transition hover:bg-blue-600"
                    style={{ height: `${Math.round((r.revenue / maxRevenue) * 100)}%`, minHeight: "4px" }}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                      ${r.revenue.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {r._id.month ? MONTHS[r._id.month - 1] : r._id.day ?? r._id.year}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment methods */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">By Payment Method</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (data?.methodBreakdown ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No payment data.</p>
          ) : (
            <ul className="space-y-3">
              {data?.methodBreakdown.map(m => (
                <li key={m._id} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-700">{m._id}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">${m.total.toLocaleString()}</span>
                    <span className="ml-1 text-xs text-gray-400">({m.count})</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
