"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight01Icon } from "hugeicons-react";

export default function StaffHeader() {
  const pathname = usePathname();
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <nav className="flex items-center gap-1 text-sm">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ArrowRight01Icon size={12} className="text-gray-300" />}
            <span className={i === crumbs.length - 1 ? "font-medium text-gray-900" : "text-gray-400"}>{c}</span>
          </span>
        ))}
      </nav>
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition">← Back to site</Link>
    </header>
  );
}
