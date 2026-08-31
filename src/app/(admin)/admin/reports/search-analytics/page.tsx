"use client";

import { useEffect, useState } from "react";
import { Search01Icon } from "hugeicons-react";

interface SearchData {
  topSearches: Array<{ query: string; count: number }>;
  searchByType: Array<{ _id: string; count: number }>;
  uniqueSearchers: number;
  totalSearches: number;
}

export default function SearchAnalyticsPage() {
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/search-analytics?days=${days}&limit=20`, { credentials: "include" })
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const maxCount = Math.max(...(data?.topSearches ?? []).map(s => s.count), 1);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">What users are searching for</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                days === d ? "bg-blue-700 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >{d}d</button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Searches", value: data?.totalSearches ?? 0 },
          { label: "Unique Searchers", value: data?.uniqueSearchers ?? 0 },
          { label: "Top Query", value: data?.topSearches[0]?.query ?? "—" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold capitalize text-gray-900">{s.value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top searches */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">Top Search Queries</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (data?.topSearches ?? []).length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Search01Icon size={18} /> No search data yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {data?.topSearches.map((s, i) => (
                <li key={s.query}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">{i + 1}</span>
                      <span className="text-sm capitalize text-gray-700">{s.query}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{s.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search by type */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">Search by Type</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (
            <ul className="space-y-4">
              {(data?.searchByType ?? []).map(t => (
                <li key={t._id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="text-sm capitalize font-medium text-gray-700">{t._id}</span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
