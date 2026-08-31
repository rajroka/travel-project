"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardSquare01Icon,
  Calendar03Icon,
  CreditCardIcon,
  UserGroupIcon,
  UserAccountIcon,
  StarIcon,
  Notification01Icon,
  BarChartIcon,
  Home01Icon,
  Settings01Icon,
  MapPinIcon,
  PackageIcon,
} from "hugeicons-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: DashboardSquare01Icon },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Bookings",  href: "/admin/bookings",  icon: Calendar03Icon },
      { label: "Payments",  href: "/admin/payments",  icon: CreditCardIcon },
      { label: "Reviews",   href: "/admin/reviews",   icon: StarIcon },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Destinations", href: "/admin/destinations", icon: MapPinIcon },
      { label: "Packages",     href: "/admin/packages",     icon: PackageIcon },
    ],
  },
  {
    label: "Users",
    items: [
      { label: "All Users",  href: "/admin/users",           icon: UserGroupIcon },
      { label: "Customers",  href: "/admin/users/customers", icon: UserAccountIcon },
      { label: "Staff",      href: "/admin/users/staff",     icon: UserAccountIcon },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Revenue",          href: "/admin/reports/revenue",           icon: BarChartIcon },
      { label: "Bookings",         href: "/admin/reports/bookings",          icon: Calendar03Icon },
      { label: "Customers",        href: "/admin/reports/customers",         icon: UserGroupIcon },
      { label: "Tour Popularity",  href: "/admin/reports/tour-popularity",   icon: StarIcon },
      { label: "Search Analytics", href: "/admin/reports/search-analytics",  icon: BarChartIcon },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Homepage", href: "/admin/content/homepage", icon: Home01Icon },
      { label: "Gallery",  href: "/admin/content/gallery",  icon: Home01Icon },
      { label: "Contact",  href: "/admin/content/contact",  icon: Settings01Icon },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Notification01Icon },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <nav className="min-h-0 flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin-light">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-blue-700 text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={17} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
