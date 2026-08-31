"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
import {
  Calendar03Icon,
  HeartCheckIcon,
  Location01Icon,
  StarIcon,
  ArrowRight01Icon,
} from "hugeicons-react";
import { FaStar } from "react-icons/fa";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardData {
  upcomingTrips: Array<{
    _id: string;
    bookingNumber: string;
    travelDate: string;
    status: string;
    package: { title: string; duration: { days: number } };
  }>;
  bookingStats: { pending: number; confirmed: number; completed: number; cancelled: number };
  favoritesCount: number;
  savedPlans: Array<{ _id: string; planName?: string; input: { destination: string } }>;
  unreadNotifications: number;
  paymentHistory: Array<{
    _id: string;
    amount: number;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
  }>;
  pendingPayments: Array<{ _id: string; bookingNumber: string; totalAmount: number }>;
}

// ─── Donut chart ────────────────────────────────────────────────────────────

function polarToCart(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function DonutChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="flex h-32 items-center justify-center text-sm text-gray-400">No data yet</div>;

  let angle = -90;
  const cx = 60; const cy = 60; const r = 44; const ir = 26;

  const slices = data.map((d) => {
    const sweep = (d.value / total) * 360;
    const s = polarToCart(cx, cy, r, angle);
    const e = polarToCart(cx, cy, r, angle + sweep - 0.01);
    const si = polarToCart(cx, cy, ir, angle);
    const ei = polarToCart(cx, cy, ir, angle + sweep - 0.01);
    const lg = sweep > 180 ? 1 : 0;
    const path = `M ${s.x} ${s.y} A ${r} ${r} 0 ${lg} 1 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${ir} ${ir} 0 ${lg} 0 ${si.x} ${si.y} Z`;
    angle += sweep;
    return { ...d, path };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="h-28 w-28 flex-shrink-0">
        {slices.map((s) => <path key={s.label} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity" />)}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1f2937">{total}</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="#6b7280">bookings</text>
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

// ─── Bar chart ───────────────────────────────────────────────────────────────

function BarChart({ payments }: { payments: DashboardData["paymentHistory"] }) {
  if (payments.length === 0) return <div className="flex h-28 items-center justify-center text-sm text-gray-400">No payment data</div>;
  const map: Record<string, number> = {};
  payments.forEach((p) => {
    const key = new Date(p.createdAt).toLocaleDateString("en-US", { month: "short" });
    map[key] = (map[key] ?? 0) + p.amount;
  });
  const months = Object.entries(map).slice(-6);
  const maxVal = Math.max(...months.map(([, v]) => v), 1);
  return (
    <div className="h-28">
      <svg viewBox={`0 0 ${months.length * 40} 80`} className="w-full h-full" preserveAspectRatio="none">
        {months.map(([label, val], i) => {
          const h = Math.max((val / maxVal) * 60, 2);
          return (
            <g key={label}>
              <rect x={i * 40 + 8} y={70 - h} width={24} height={h} rx={3} fill="#3b82f6" />
              <text x={i * 40 + 20} y={78} textAnchor="middle" fontSize="6" fill="#9ca3af">{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CustomerDashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/customer", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setData(json.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Upcoming",   value: data?.bookingStats.confirmed ?? 0, icon: <Calendar03Icon size={20} className="text-blue-600" />,  bg: "bg-blue-50",   href: "/dashboard/upcoming-trips" },
    { label: "Completed",  value: data?.bookingStats.completed ?? 0, icon: <Location01Icon size={20} className="text-green-600" />, bg: "bg-green-50",  href: "/dashboard/bookings" },
    { label: "Favourites", value: data?.favoritesCount ?? 0,         icon: <HeartCheckIcon size={20} className="text-red-500" />,   bg: "bg-red-50",    href: "/dashboard/favorites" },
    { label: "AI Plans",   value: data?.savedPlans.length ?? 0,      icon: <StarIcon size={20} className="text-purple-600" />,      bg: "bg-purple-50", href: "/dashboard/ai-plans" },
  ];

  const bookingChartData = [
    { label: "Confirmed", value: data?.bookingStats.confirmed ?? 0, color: "#22c55e" },
    { label: "Pending",   value: data?.bookingStats.pending   ?? 0, color: "#f59e0b" },
    { label: "Completed", value: data?.bookingStats.completed ?? 0, color: "#3b82f6" },
    { label: "Cancelled", value: data?.bookingStats.cancelled ?? 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="mx-auto max-w-5xl p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] ?? "Traveller"} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s your travel overview.</p>
      </div>

      {/* Pending payment banner */}
      {(data?.pendingPayments?.length ?? 0) > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-medium text-amber-800">
            You have {data!.pendingPayments.length} booking{data!.pendingPayments.length > 1 ? "s" : ""} with pending payment.
          </p>
          <Link href="/dashboard/payments" className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-700 transition">
            Pay now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>{s.icon}</div>
            {loading
              ? <div className="h-7 w-10 animate-pulse rounded bg-gray-100" />
              : <span className="text-2xl font-bold text-gray-900">{s.value}</span>
            }
            <span className="text-xs text-gray-500">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">Booking Status</h2>
          {loading ? <div className="h-28 animate-pulse rounded-xl bg-gray-100" /> : <DonutChart data={bookingChartData} />}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Spend History</h2>
            <Link href="/dashboard/payments" className="text-xs text-blue-600 hover:underline">See all</Link>
          </div>
          {loading ? <div className="h-28 animate-pulse rounded-xl bg-gray-100" /> : <BarChart payments={data?.paymentHistory ?? []} />}
        </div>
      </div>

      {/* Bottom */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Upcoming trips */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Upcoming Trips</h2>
            <Link href="/dashboard/upcoming-trips" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (data?.upcomingTrips ?? []).length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Calendar03Icon size={40} className="mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No upcoming trips.</p>
              <Link href="/packages" className="mt-2 text-xs text-blue-600 hover:underline">Browse packages →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.upcomingTrips.slice(0, 4).map((trip) => (
                <Link key={trip._id} href={`/bookings/${trip._id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Calendar03Icon size={16} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{trip.package.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(trip.travelDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      · {trip.package.duration.days}D
                    </p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    trip.status === "confirmed" ? "bg-green-100 text-green-700" :
                    trip.status === "pending"   ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{trip.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Payments + AI plans */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Payments</h2>
              <Link href="/dashboard/payments" className="text-xs text-blue-600 hover:underline">See all</Link>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />)}</div>
            ) : (data?.paymentHistory ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">No payments yet.</p>
            ) : (
              <div className="space-y-2">
                {data?.paymentHistory.slice(0, 3).map((p) => (
                  <div key={p._id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium capitalize text-gray-800">{p.paymentMethod}</p>
                      <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${p.amount}</p>
                      <span className={`text-xs capitalize ${p.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                        {p.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(data?.savedPlans ?? []).length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Saved AI Plans</h2>
                <Link href="/dashboard/ai-plans" className="text-xs text-blue-600 hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {data?.savedPlans.slice(0, 3).map((plan) => (
                  <Link key={plan._id} href="/dashboard/ai-plans"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                      <StarIcon size={15} className="text-purple-600" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                      {plan.planName ?? plan.input.destination}
                    </p>
                    <ArrowRight01Icon size={14} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
