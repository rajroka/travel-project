"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight01Icon } from "hugeicons-react";

export default function AdminHeader() {
  const pathname = usePathname();

  // Build readable breadcrumb from pathname
  // e.g. /admin/reports/revenue → ["admin", "reports", "revenue"]
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ArrowRight01Icon size={12} className="text-gray-300" />}
            <span className={i === crumbs.length - 1 ? "font-medium text-gray-900" : "text-gray-400"}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Back to site */}
      <Link
        href="/"
        className="text-sm text-gray-400 transition hover:text-gray-700"
      >
        ← Back to site
      </Link>
    </header>
  );
}
