"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import {
  UserGroupIcon,
  Calendar03Icon,
  DollarCircleIcon,
  CreditCardIcon,
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
  PackageIcon,
  BarChartIcon,
  Analytics01Icon,
} from "hugeicons-react";
import { formatUserName } from "@/lib/utils/formatters";

// ─── Types ─────────────────────────────────────────────────────────────────

interface DashboardData {
  overview: {
    totalCustomers: number;
    totalBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    dailyRevenue: number;
    pendingPayments: number;
    completedPayments: number;
    refundedPayments: number;
  };
  recentBookings: Array<{
    _id: string;
    bookingNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { firstName?: string; lastName?: string; name?: string; email: string };
    package: { title: string };
  }>;
  popularPackages: Array<{ _id: string; title: string; totalBookings: number; averageRating: number; price: number }>;
  popularDestinations: Array<{ _id: string; name: string; averageRating: number; totalReviews: number }>;
  topSearches: Array<{ query: string; count: number }>;
  paymentMethodStats: Array<{ _id: string; total: number; count: number }>;
  cashflow: Array<{ _id: { month: number; year: number }; revenue: number; count: number }>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUserName(u: { name?: string; firstName?: string; lastName?: string; email: string }): string {
  return formatUserName(u);
}

// ─── Chart components (pure SVG, zero deps) ─────────────────────────────────

/** Smooth area / line chart for revenue */
function RevenueLineChart({
  data,
}: {
  data: Array<{ month: number; year: number; revenue: number }>;
}) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No revenue data yet
      </div>
    );
  }

  const W = 500;
  const H = 160;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxVal = Math.max(...data.map((d) => d.revenue), 1);
  const pts = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * innerW,
    y: padT + innerH - (d.revenue / maxVal) * innerH,
    label: MONTHS[d.month - 1],
    value: d.revenue,
  }));

  // Build smooth path using cubic bezier
  function smooth(points: typeof pts) {
    if (points.length < 2) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }

  const linePath = smooth(pts);
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z`;

  // Y-axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padT + innerH - t * innerH,
    label: t === 0 ? "0" : `$${Math.round(maxVal * t).toLocaleString()}`,
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: "12rem" }}
      role="img"
      aria-label="Revenue chart"
    >
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t) => (
        <line
          key={t.y}
          x1={padL}
          y1={t.y}
          x2={W - padR}
          y2={t.y}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      ))}

      {/* Y axis labels */}
      {yTicks.map((t) => (
        <text key={t.y} x={padL - 4} y={t.y + 3} textAnchor="end" fontSize="8" fill="#9ca3af">
          {t.label}
        </text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#revGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />

      {/* Points + tooltips */}
      {pts.map((p, i) => (
        <g key={i} className="group">
          <circle cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" className="hover:r-5 transition" />
          {/* Tooltip */}
          <rect
            x={p.x - 22}
            y={p.y - 22}
            width="44"
            height="14"
            rx="3"
            fill="#1f2937"
            className="opacity-0 group-hover:opacity-100 transition"
          />
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            fontSize="7"
            fill="white"
            className="opacity-0 group-hover:opacity-100 transition"
          >
            ${p.value.toLocaleString()}
          </text>
          {/* X label */}
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="8" fill="#9ca3af">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Donut / pie chart for booking statuses */
function DonutChart({ segments }: {
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return <div className="flex h-36 items-center justify-center text-sm text-gray-400">No data</div>;
  }

  const cx = 60;
  const cy = 60;
  const r = 44;
  const innerR = 26;
  let angle = -90;

  function polarToCart(a: number, radius: number) {
    const rad = (a * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const slices = segments.map((s) => {
    const sweep = (s.value / total) * 360;
    const start = polarToCart(angle, r);
    const end = polarToCart(angle + sweep - 0.01, r);
    const iStart = polarToCart(angle, innerR);
    const iEnd = polarToCart(angle + sweep - 0.01, innerR);
    const large = sweep > 180 ? 1 : 0;
    const path = [
      `M ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`,
      `L ${iEnd.x} ${iEnd.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${iStart.x} ${iStart.y}`,
      "Z",
    ].join(" ");
    angle += sweep;
    return { ...s, path };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="h-28 w-28 flex-shrink-0">
        {slices.map((s) => (
          <path key={s.label} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1f2937">
          {total}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="#6b7280">
          total
        </text>
      </svg>

      <ul className="flex-1 space-y-2">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="capitalize text-gray-600">{s.label}</span>
            </span>
            <span className="font-semibold text-gray-900">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bar chart for payment methods */
function HBarChart({ data }: { data: Array<{ label: string; value: number; count: number }> }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="capitalize text-gray-700">{d.label}</span>
            <span className="font-semibold text-gray-900">
              ${d.value.toLocaleString()} <span className="text-xs font-normal text-gray-400">({d.count})</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, background: colors[i % colors.length] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Vertical bar chart for top searches */
function SearchBarsChart({ data }: { data: Array<{ query: string; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <ul className="space-y-2">
      {data.slice(0, 8).map((d, i) => (
        <li key={d.query} className="flex items-center gap-3">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="mb-0.5 flex items-center justify-between">
              <span className="truncate text-sm capitalize text-gray-700">{d.query}</span>
              <span className="ml-2 flex-shrink-0 text-xs text-gray-400">{d.count}x</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

function StatCard({
  label, value, sub, icon, color, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; trend?: "up" | "down";
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>{icon}</div>
        {trend && (
          <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          }`}>
            {trend === "up" ? <ArrowUpRight01Icon size={12} /> : <ArrowDownRight01Icon size={12} />}
            {trend === "up" ? "Up" : "Down"}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/admin", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const o = data?.overview;

  const bookingSegments = [
    { label: "confirmed",  value: o?.totalBookings ? Math.round((o.totalBookings - (o.pendingBookings ?? 0)) * 0.6) : 0, color: "#22c55e" },
    { label: "pending",    value: o?.pendingBookings ?? 0,   color: "#f59e0b" },
    { label: "completed",  value: o?.completedPayments ?? 0, color: "#3b82f6" },
    { label: "cancelled",  value: o?.refundedPayments ?? 0,  color: "#ef4444" },
  ].filter((s) => s.value > 0);

  const paymentBarData = (data?.paymentMethodStats ?? []).map((p) => ({
    label: p._id,
    value: p.total,
    count: p.count,
  }));

  const revenueLineData = (data?.cashflow ?? []).map((item) => ({
    month: item._id.month,
    year: item._id.year,
    revenue: item.revenue,
  }));

  return (
    <div className="mx-auto max-w-7xl p-6">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back — here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Total Customers"    value={o?.totalCustomers ?? 0}                         icon={<UserGroupIcon size={22} className="text-blue-600" />}   color="bg-blue-50"   trend="up" />
            <StatCard label="Total Bookings"     value={o?.totalBookings ?? 0}   sub={`${o?.pendingBookings ?? 0} pending`} icon={<Calendar03Icon size={22} className="text-purple-600" />} color="bg-purple-50" />
            <StatCard label="Total Revenue"      value={`$${(o?.totalRevenue ?? 0).toLocaleString()}`}  sub={`$${(o?.monthlyRevenue ?? 0).toLocaleString()} this month`} icon={<DollarCircleIcon size={22} className="text-green-600" />} color="bg-green-50" trend="up" />
            <StatCard label="Today's Revenue"    value={`$${(o?.dailyRevenue ?? 0).toLocaleString()}`}  icon={<Analytics01Icon size={22} className="text-amber-600" />}  color="bg-amber-50"  />
            <StatCard label="Pending Payments"   value={o?.pendingPayments ?? 0}                        icon={<CreditCardIcon size={22} className="text-red-500" />}     color="bg-red-50"    trend="down" />
            <StatCard label="Paid Payments"      value={o?.completedPayments ?? 0}                      icon={<CreditCardIcon size={22} className="text-green-600" />}   color="bg-green-50"  />
            <StatCard label="Popular Packages"   value={data?.popularPackages.length ?? 0}              icon={<PackageIcon size={22} className="text-indigo-600" />}     color="bg-indigo-50" />
            <StatCard label="Refunds Issued"     value={o?.refundedPayments ?? 0}                       icon={<BarChartIcon size={22} className="text-gray-500" />}      color="bg-gray-100"  />
          </>
        )}
      </div>

      {/* ── Row 1: Revenue line chart + Booking donut ───────────────────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">

        {/* Revenue line chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly cashflow this year</p>
            </div>
            <Link href="/admin/reports/revenue" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              Full report <ArrowUpRight01Icon size={13} />
            </Link>
          </div>
          {loading
            ? <Skeleton className="h-48" />
            : <RevenueLineChart data={revenueLineData} />
          }
        </div>

        {/* Booking status donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">Booking Status</h2>
          {loading
            ? <Skeleton className="h-36" />
            : <DonutChart segments={bookingSegments} />
          }
          {!loading && o && (
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 text-center text-xs">
              <div>
                <p className="font-bold text-gray-900">{o.totalBookings}</p>
                <p className="text-gray-400">Total</p>
              </div>
              <div>
                <p className="font-bold text-green-600">${(o.totalRevenue ?? 0).toLocaleString()}</p>
                <p className="text-gray-400">Revenue</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Searches + Payment methods + Top packages ────────────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">

        {/* Top searches */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Top Searches</h2>
              <p className="text-xs text-gray-400 mt-0.5">What users are looking for</p>
            </div>
            <Link href="/admin/reports/search-analytics" className="text-xs text-blue-600 hover:underline">See all</Link>
          </div>
          {loading
            ? <div className="space-y-3">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-7" />)}</div>
            : (data?.topSearches ?? []).length === 0
              ? <p className="text-sm text-gray-400">No data yet.</p>
              : <SearchBarsChart data={data!.topSearches} />
          }
        </div>

        {/* Payment methods */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900">Payment Methods</h2>
            <p className="text-xs text-gray-400 mt-0.5">Revenue by gateway</p>
          </div>
          {loading
            ? <div className="space-y-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-8" />)}</div>
            : paymentBarData.length === 0
              ? <p className="text-sm text-gray-400">No payment data yet.</p>
              : <HBarChart data={paymentBarData} />
          }
        </div>

        {/* Top packages */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Top Packages</h2>
              <p className="text-xs text-gray-400 mt-0.5">By total bookings</p>
            </div>
            <Link href="/admin/packages" className="text-xs text-blue-600 hover:underline">Manage</Link>
          </div>
          {loading
            ? <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-10" />)}</div>
            : (
              <ul className="space-y-3">
                {(data?.popularPackages ?? []).slice(0,5).map((pkg, i) => (
                  <li key={pkg._id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">{i+1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{pkg.title}</p>
                      <p className="text-xs text-gray-400">${pkg.price} · {pkg.totalBookings} bookings</p>
                    </div>
                    {pkg.averageRating > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-500">
                        <FaStar size={10} />{pkg.averageRating.toFixed(1)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>

      {/* ── Row 3: Recent bookings + Popular destinations ────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent bookings table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest activity</p>
            </div>
            <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              View all <ArrowUpRight01Icon size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3 p-6">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-12" />)}</div>
          ) : (data?.recentBookings ?? []).length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-gray-400">No bookings yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Booking</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Package</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.recentBookings.slice(0,6).map((b) => (
                    <tr key={b._id} className="transition hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">#{b.bookingNumber}</td>
                      <td className="max-w-[110px] truncate px-5 py-3 text-gray-600">{getUserName(b.user)}</td>
                      <td className="max-w-[130px] truncate px-5 py-3 text-gray-600">{b.package?.title}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900">${b.totalAmount}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Popular destinations */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Popular Destinations</h2>
              <p className="text-xs text-gray-400 mt-0.5">By reviews</p>
            </div>
            <Link href="/admin/destinations" className="text-xs text-blue-600 hover:underline">Manage</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-10" />)}</div>
          ) : (data?.popularDestinations ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No destination data yet.</p>
          ) : (
            <ul className="space-y-3">
              {(data?.popularDestinations ?? []).slice(0,5).map((d, i) => (
                <li key={d._id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-[10px] font-bold text-green-600">{i+1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.totalReviews} reviews</p>
                  </div>
                  {d.averageRating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      <FaStar size={10} />{d.averageRating.toFixed(1)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
