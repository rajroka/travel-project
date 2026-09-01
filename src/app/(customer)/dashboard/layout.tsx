"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { getAuthoritativeDashboardPath } from "@/lib/auth/role-redirect";
import {
  Calendar03Icon,
  HeartCheckIcon,
  Notification01Icon,
  CreditCardIcon,
  UserIcon,
  Clock01Icon,
  DashboardSquare01Icon,
} from "hugeicons-react";

const NAV_ITEMS = [
  { label: "Overview",       href: "/dashboard",                icon: DashboardSquare01Icon },
  { label: "Upcoming Trips", href: "/dashboard/upcoming-trips", icon: Calendar03Icon },
  { label: "My Bookings",    href: "/dashboard/bookings",       icon: Clock01Icon },
  { label: "Payments",       href: "/dashboard/payments",       icon: CreditCardIcon },
  { label: "Favourites",     href: "/dashboard/favorites",      icon: HeartCheckIcon },
  { label: "Notifications",  href: "/dashboard/notifications",  icon: Notification01Icon },
  { label: "Profile",        href: "/dashboard/profile",        icon: UserIcon },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    const role = (session?.user as { role?: string } | undefined)?.role;
    getAuthoritativeDashboardPath(role).then((dashboardPath) => {
      if (dashboardPath !== "/dashboard") {
        router.replace(dashboardPath);
      }
    });
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">

        {/* Nav links */}
        <nav className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin-light">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-blue-700 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

      </aside>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto scrollbar-thin-light">
        {children}
      </main>
    </div>
  );
}
