"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { dashboardPathForRole } from "@/lib/auth/role-redirect";
import { FiSearch, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut, FiMenu, FiX } from "react-icons/fi";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "Packages", href: "/packages" },
  { label: "About", href: "/about" },
];

type NavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  // ── Persist last known user so navbar doesn't flash to guest on navigation ──
  const [cachedUser] = useState<NavUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("_nav_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      const sessionUser = user as NavUser;
      const toCache = {
        name: sessionUser.name ?? "",
        email: sessionUser.email ?? "",
        image: sessionUser.image ?? undefined,
        role: sessionUser.role,
      };
      localStorage.setItem("_nav_user", JSON.stringify(toCache));
    } else if (!isPending) {
      // Confirmed not logged in — clear cache
      localStorage.removeItem("_nav_user");
    }
  }, [user, isPending]);

  // Show cached user while session is being fetched to prevent flash
  const displayUser = (user as NavUser | undefined) ?? (isPending ? cachedUser : null);

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const dashboardHref = dashboardPathForRole(
    displayUser?.role
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2.5">
          <Image
            src="/Nepal.png"
            alt="nepaltravels logo"
            width={36}
            height={36}
            className="rounded-xl object-contain"
          />
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">
            nepaltravels
          </span>
        </Link>

        {/* ── Desktop nav (center) ──────────────────────────────────────── */}
        <nav className="hidden flex-1 justify-center md:flex">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Right side ───────────────────────────────────────────────── */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-2">

          {/* Search bar (hidden on mobile) */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="h-9 w-44 rounded-full border border-gray-200 bg-gray-50 pl-8 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:w-56"
            />
          </form>

          {/* Auth section */}
          {isPending && !cachedUser ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
          ) : displayUser ? (
            <>
              {/* Notification bell with red dot */}
              <Link
                href="/dashboard/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
                aria-label="Notifications"
              >
                <FiBell className="text-[18px]" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </Link>

              {/* Avatar + name dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition hover:bg-gray-100"
                >
                  {displayUser.image ? (
                    <Image
                      src={displayUser.image}
                      alt={displayUser.name ?? "User"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {displayUser.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium text-gray-800 md:block">
                    {displayUser.name?.split(" ")[0]}
                  </span>
                  <FiChevronDown
                    className={`hidden text-xs text-gray-400 transition-transform md:block ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-gray-900">{displayUser.name}</p>
                      <p className="truncate text-xs text-gray-400">{displayUser.email}</p>
                    </div>
                    <Link href={dashboardHref} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                      <FiUser className="text-gray-400" /> Dashboard
                    </Link>
                    <Link href="/dashboard/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                      <FiSettings className="text-gray-400" /> Settings
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                      <FiLogOut /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest: Sign in + Register */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations or packages…"
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </form>

          {/* Nav links */}
          <nav className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            {displayUser ? (
              <div className="space-y-1">
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <FiUser className="text-gray-400" /> Dashboard
                </Link>
                <Link href="/dashboard/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <FiSettings className="text-gray-400" /> Settings
                </Link>
                <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50">
                  <FiLogOut /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
