"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
import {
  Calendar03Icon,
  HeartCheckIcon,
  Location01Icon,
  Notification01Icon,
  CreditCardIcon,
  UserIcon,
  StarIcon,
  Clock01Icon,
  ArrowRight01Icon,
} from "hugeicons-react";

interface DashboardData {
  upcomingTrips: Array<{
    _id: string;
    bookingNumber: string;
    travelDate: string;
    status: string;
    package: { title: string; coverImage?: string; duration: { days: number } };
  }>;
  bookingStats: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
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
    {
      label: "Upcoming Trips",
      value: data?.bookingStats.confirmed ?? 0,
      icon: <Calendar03Icon size={22} className="text-blue-600" />,
      bg: "bg-blue-50",
      href: "/dashboard/upcoming-trips",
    },
    {
      label: "Completed Trips",
      value: data?.bookingStats.completed ?? 0,
      icon: <Location01Icon size={22} className="text-green-600" />,
      bg: "bg-green-50",
      href: "/dashboard/bookings",
    },
    {
      label: "Favourites",
      value: data?.favoritesCount ?? 0,
      icon: <HeartCheckIcon size={22} className="text-red-500" />,
      bg: "bg-red-50",
      href: "/dashboard/favorites",
    },
    {
      label: "AI Plans Saved",
      value: data?.savedPlans.length ?? 0,
      icon: <StarIcon size={22} className="text-purple-600" />,
      bg: "bg-purple-50",
      href: "/dashboard/ai-plans",
    },
  ];

  const navItems = [
    { label: "Upcoming Trips", icon: <Calendar03Icon size={16} />, href: "/dashboard/upcoming-trips" },
    { label: "My Bookings", icon: <Clock01Icon size={16} />, href: "/dashboard/bookings" },
    { label: "Payments", icon: <CreditCardIcon size={16} />, href: "/dashboard/payments" },
    { label: "Favourites", icon: <HeartCheckIcon size={16} />, href: "/dashboard/favorites" },
    { label: "AI Trip Plans", icon: <StarIcon size={16} />, href: "/dashboard/ai-plans" },
    { label: "Notifications", icon: <Notification01Icon size={16} />, href: "/dashboard/notifications" },
    { label: "Profile", icon: <UserIcon size={16} />, href: "/dashboard/profile" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] ?? "Traveller"} 👋
        </h1>
        <p className="mt-1 text-gray-500">Here&apos;s what&apos;s happening with your trips.</p>
      </div>

      {/* Pending payment banner */}
      {data?.pendingPayments && data.pendingPayments.length > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-sm font-medium text-amber-800">
            You have {data.pendingPayments.length} booking{data.pendingPayments.length > 1 ? "s" : ""} with pending payment.
          </p>
          <Link href="/dashboard/payments" className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-700 transition">
            Pay now
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl`}>
              {s.icon}
            </div>
            {loading ? (
              <div className="h-7 w-12 animate-pulse rounded bg-gray-100" />
            ) : (
              <span className="text-3xl font-bold text-gray-900">{s.value}</span>
            )}
            <span className="text-sm text-gray-500">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Upcoming trips */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Trips</h2>
            <Link href="/dashboard/upcoming-trips" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : data?.upcomingTrips.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Calendar03Icon size={48} className="mb-3 text-gray-300" />
              <p className="text-gray-400">No upcoming trips yet.</p>
              <Link href="/packages" className="mt-3 text-sm font-medium text-blue-600 hover:underline">
                Browse packages →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.upcomingTrips.slice(0, 5).map((trip) => (
                <div key={trip._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{trip.package.title}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(trip.travelDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      {trip.package.duration.days} days
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    trip.status === "confirmed" ? "bg-green-100 text-green-700" :
                    trip.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {trip.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Quick links */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Access</h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <span className="text-gray-400">{item.icon}</span>
                  {item.label}
                  {item.label === "Notifications" && (data?.unreadNotifications ?? 0) > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {data?.unreadNotifications}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Recent payments */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
              <Link href="/dashboard/payments" className="text-xs text-blue-600 hover:underline">See all</Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />)}
              </div>
            ) : data?.paymentHistory.length === 0 ? (
              <p className="text-sm text-gray-400">No payments yet.</p>
            ) : (
              <div className="space-y-2">
                {data?.paymentHistory.slice(0, 3).map((p) => (
                  <div key={p._id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">{p.paymentMethod}</p>
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

        </div>
      </div>
    </div>
  );
}
