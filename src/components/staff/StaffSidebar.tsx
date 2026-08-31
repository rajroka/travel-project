"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardSquare01Icon,
  Calendar03Icon,
  UserGroupIcon,
  MapPinIcon,
  PackageIcon,
  CreditCardIcon,
  StarIcon,
  CalendarCheckIn01Icon,
} from "hugeicons-react";

const NAV = [
  { label: "Dashboard",    href: "/staff/dashboard",    icon: DashboardSquare01Icon },
  { label: "Bookings",     href: "/staff/bookings",     icon: Calendar03Icon },
  { label: "Schedule",     href: "/staff/schedule",     icon: CalendarCheckIn01Icon },
  { label: "Customers",    href: "/staff/customers",    icon: UserGroupIcon },
  { label: "Destinations", href: "/staff/destinations", icon: MapPinIcon },
  { label: "Packages",     href: "/staff/packages",     icon: PackageIcon },
  { label: "Payments",     href: "/staff/payments",     icon: CreditCardIcon },
  { label: "Reviews",      href: "/staff/reviews",      icon: StarIcon },
];

export default function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <nav className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin-light">
        <ul className="space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/staff/dashboard" && pathname.startsWith(href));
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
  );
}
