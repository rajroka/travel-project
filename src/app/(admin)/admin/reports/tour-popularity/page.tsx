"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { PackageIcon } from "hugeicons-react";

interface PopularityData {
  packagesByBookings: Array<{ _id: string; title: string; totalBookings: number; averageRating: number; price: number }>;
  packagesByRevenue: Array<{ package: { title: string; price: number }; revenue: number; bookingCount: number }>;
  packagesByRating: Array<{ _id: string; title: string; averageRating: number; totalReviews: number; price: number }>;
}

export default function TourPopularityPage() {
  const [data, setData] = useState<PopularityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/tour-popularity?limit=8", { credentials: "include" })
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function TableSkeleton() {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tour Popularity</h1>
        <p className="mt-1 text-sm text-gray-500">Package performance analytics</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By bookings */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">Most Booked</h2>
          {loading ? <TableSkeleton /> : (data?.packagesByBookings ?? []).length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-400"><PackageIcon size={18} /> No data yet.</div>
          ) : (
            <ul className="space-y-3">
              {data?.packagesByBookings.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400">${p.price}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{p.totalBookings}</p>
                    <p className="text-xs text-gray-400">bookings</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* By revenue */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">Highest Revenue</h2>
          {loading ? <TableSkeleton /> : (data?.packagesByRevenue ?? []).length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-400"><PackageIcon size={18} /> No data yet.</div>
          ) : (
            <ul className="space-y-3">
              {data?.packagesByRevenue.map((p, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{p.package?.title}</p>
                    <p className="text-xs text-gray-400">{p.bookingCount} bookings</p>
                  </div>
                  <span className="flex-shrink-0 text-sm font-bold text-gray-900">${p.revenue.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* By rating */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 font-semibold text-gray-900">Top Rated Packages</h2>
          {loading ? <TableSkeleton /> : (data?.packagesByRating ?? []).length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-400"><PackageIcon size={18} /> No reviews yet.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data?.packagesByRating.map((p, i) => (
                <div key={p._id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <p className="mt-1 text-sm font-semibold text-gray-800 line-clamp-2">{p.title}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <FaStar size={12} className="text-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{p.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({p.totalReviews})</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">${p.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
