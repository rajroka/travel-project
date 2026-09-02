"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar03Icon, CreditCardIcon, ArrowRight01Icon, Clock01Icon } from "hugeicons-react";
import { formatUserName } from "@/lib/utils/formatters";

interface DashboardUser {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface StaffData {
  todayBookings: Array<{ _id: string; bookingNumber: string; status: string; user: DashboardUser; package: { title: string } }>;
  todayBookingsCount: number;
  pendingApprovals: Array<{ _id: string; bookingNumber: string; totalAmount: number; user: DashboardUser; package: { title: string }; createdAt: string }>;
  pendingApprovalsCount: number;
  recentCustomers: Array<DashboardUser & { _id: string; createdAt: string }>;
  pendingPayments: Array<{ _id: string; amount: number; booking: { bookingNumber: string }; user: DashboardUser }>;
  recentPayments: Array<{ _id: string; amount: number; paymentMethod: string; paymentStatus: string; createdAt: string }>;
  upcomingSchedule: Array<{ _id: string; bookingNumber: string; travelDate: string; user: DashboardUser; package: { title: string; duration: { days: number } } }>;
  overview?: {
    totalBookings: number;
    totalCustomers: number;
    pendingApprovals: number;
    pendingCashPayments: number;
    pendingPayments: number;
    completedPayments: number;
    totalRevenue: number;
  };
}

function getUserName(user?: DashboardUser): string {
  return formatUserName(user);
}

export default function StaffDashboardPage() {
  const [data, setData] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/staff", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Bookings", value: data?.overview?.totalBookings ?? 0, icon: <Calendar03Icon size={22} className="text-blue-600" />, bg: "bg-blue-50", href: "/staff/bookings" },
    { label: "Pending Approvals", value: data?.overview?.pendingApprovals ?? data?.pendingApprovalsCount ?? 0, icon: <Clock01Icon size={22} className="text-amber-600" />, bg: "bg-amber-50", href: "/staff/bookings" },
    { label: "Upcoming Trips", value: data?.upcomingSchedule.length ?? 0, icon: <Calendar03Icon size={22} className="text-green-600" />, bg: "bg-green-50", href: "/staff/schedule" },
    { label: "Cash to Verify", value: data?.overview?.pendingCashPayments ?? data?.pendingPayments.length ?? 0, icon: <CreditCardIcon size={22} className="text-red-500" />, bg: "bg-red-50", href: "/staff/payments" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Today&apos;s operations overview</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>{s.icon}</div>
            {loading ? (
              <div className="h-7 w-12 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            )}
            <p className="mt-0.5 text-sm text-gray-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Pending approvals */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
            <Link href="/staff/bookings" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight01Icon size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (data?.pendingApprovals ?? []).length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">No pending approvals</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data?.pendingApprovals.slice(0, 5).map((b) => (
                <li key={b._id} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">#{b.bookingNumber}</p>
                    <p className="text-xs text-gray-400 truncate">{getUserName(b.user)} · {b.package.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-900">${b.totalAmount}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming schedule */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Upcoming Schedule</h2>
            <Link href="/staff/schedule" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight01Icon size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (data?.upcomingSchedule ?? []).length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">No upcoming trips</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data?.upcomingSchedule.slice(0, 5).map((b) => (
                <li key={b._id} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.package.title}</p>
                    <p className="text-xs text-gray-400 truncate">{getUserName(b.user)}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2.5 py-1">
                    {new Date(b.travelDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent customers */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Recent Customers</h2>
            <Link href="/staff/customers" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight01Icon size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[1,2].map((i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (data?.recentCustomers ?? []).length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">No recent customers</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data?.recentCustomers.slice(0, 5).map((c) => (
                <li key={c._id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {getUserName(c).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getUserName(c)}</p>
                      <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending cash payments */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Cash Payments to Verify</h2>
            <Link href="/staff/payments" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight01Icon size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[1,2].map((i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (data?.pendingPayments ?? []).length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">No pending cash payments</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data?.pendingPayments.map((p) => (
                <li key={p._id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{p.booking?.bookingNumber}</p>
                    <p className="text-xs text-gray-400">{getUserName(p.user)}</p>
                  </div>
                  <span className="font-bold text-gray-900">${p.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
