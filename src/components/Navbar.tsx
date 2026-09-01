"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { dashboardPathForRole } from "@/lib/auth/role-redirect";
import {
  FiChevronDown, FiChevronRight, FiUser, FiSettings,
  FiLogOut, FiMenu, FiX, FiBell, FiPhone,
} from "react-icons/fi";

// ── Static category structure — real packages loaded dynamically ─────────────
const CATEGORIES = [
  { label: "Trekking in Nepal",         query: "trekking" },
  { label: "Tour in Nepal",             query: "tour" },
  { label: "Climbing & Expedition",     query: "climbing" },
  { label: "Day Tour in Nepal",         query: "day+tour" },
  { label: "Family Holiday Packages",   query: "family" },
  { label: "Peak Climbing Packages",    query: "peak+climbing" },
  { label: "Hiking",                    query: "hiking" },
  { label: "Friends Packages",          query: "friends" },
];

const COMPANY_LINKS = [
  { label: "About Us",  href: "/about" },
  { label: "Our Team",  href: "/about#team" },
  { label: "FAQs",      href: "/#faq" },
  { label: "Terms",     href: "/terms" },
  { label: "Privacy",   href: "/privacy" },
];

interface NavPackage { _id: string; title: string; slug: string; duration: { days: number } }
interface NavDestination { _id: string; name: string; slug: string; location: { city: string; country: string } }

type NavUser = { name?: string | null; email?: string | null; image?: string | null; role?: string };

const PKG_LIMIT  = 6;
const DEST_LIMIT = 8;

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as NavUser | undefined;

  const displayUser = user ?? null;

  // which top-level dropdown is open
  const [openNav, setOpenNav]           = useState<string | null>(null);
  // which left-panel category is hovered
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].label);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  // dynamic packages cache: category label → packages
  const [pkgCache, setPkgCache] = useState<Record<string, NavPackage[]>>({});
  const [pkgLoading, setPkgLoading] = useState(false);
  // dynamic destinations
  const [destinations, setDestinations] = useState<NavDestination[]>([]);
  const [destLoading, setDestLoading] = useState(false);
  const [destLoaded, setDestLoaded] = useState(false);

  const navTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRef   = useRef<HTMLDivElement>(null);

  const fetchCategory = useCallback(async (cat: typeof CATEGORIES[0]) => {
    if (pkgCache[cat.label]) return;
    setPkgLoading(true);
    try {
      const res = await fetch(`/api/packages?search=${cat.query}&limit=${PKG_LIMIT}&active=true`);
      const j = await res.json() as { success: boolean; data?: { packages: NavPackage[] } };
      if (j.success) setPkgCache(prev => ({ ...prev, [cat.label]: j.data!.packages.slice(0, PKG_LIMIT) }));
    } catch { /* ignore */ }
    finally { setPkgLoading(false); }
  }, [pkgCache]);

  const fetchDestinations = useCallback(async () => {
    if (destLoaded) return;
    setDestLoading(true);
    try {
      const res = await fetch(`/api/destinations?limit=${DEST_LIMIT}&sort=popular`);
      const j = await res.json() as { success: boolean; data?: { destinations: NavDestination[] } };
      if (j.success) { setDestinations(j.data!.destinations.slice(0, DEST_LIMIT)); setDestLoaded(true); }
    } catch { /* ignore */ }
    finally { setDestLoading(false); }
  }, [destLoaded]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function enterNav(name: string) {
    if (navTimer.current) clearTimeout(navTimer.current);
    setOpenNav(name);
    if (name === "Nepal") {
      setActiveCategory(CATEGORIES[0].label);
      fetchCategory(CATEGORIES[0]);
    }
    if (name === "Destinations") {
      fetchDestinations();
    }
  }
  function leaveNav() {
    navTimer.current = setTimeout(() => setOpenNav(null), 150);
  }

  function hoverCategory(cat: typeof CATEGORIES[0]) {
    setActiveCategory(cat.label);
    fetchCategory(cat);
  }

  async function handleSignOut() { await signOut(); router.push("/"); router.refresh(); }
  const dashboardHref = dashboardPathForRole(displayUser?.role);

  const activeCat = CATEGORIES.find(c => c.label === activeCategory) ?? CATEGORIES[0];
  const activePackages = pkgCache[activeCategory] ?? [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2.5">
          <Image src="/Nepal.png" alt="Adventure Treks Nepal" width={38} height={38} className="object-contain" />
          <div className="hidden leading-none sm:block">
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-blue-700">Adventure</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400">Treks · Nepal</p>
          </div>
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────── */}
        <nav className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center">

            {/* Home */}
            <li>
              <Link href="/" className="flex items-center gap-1 px-4 py-5 text-sm font-medium text-gray-700 hover:text-blue-700 transition">
                Home
              </Link>
            </li>

            {/* Destinations ── simple dropdown */}
            <li
              className="relative"
              onMouseEnter={() => enterNav("Destinations")}
              onMouseLeave={leaveNav}
            >
              <button className={`flex items-center gap-1 px-4 py-5 text-sm font-medium transition ${openNav === "Destinations" ? "text-blue-700" : "text-gray-700 hover:text-blue-700"}`}>
                Destinations
                <FiChevronDown size={13} className={`transition-transform ${openNav === "Destinations" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {openNav === "Destinations" && (
                <div
                  className="absolute left-0 top-full z-50 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-2xl"
                  onMouseEnter={() => enterNav("Destinations")}
                  onMouseLeave={leaveNav}
                >
                  {destLoading && destinations.length === 0 ? (
                    <div className="space-y-2 px-4 py-3">
                      {[1,2,3].map(i => <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />)}
                    </div>
                  ) : destinations.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">No destinations yet.</p>
                  ) : (
                    <>
                      {destinations.map(d => (
                        <Link
                          key={d._id}
                          href={`/destinations/${d.slug}`}
                          onClick={() => setOpenNav(null)}
                          className="flex items-center justify-between px-5 py-2.5 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <span>{d.name}</span>
                          <span className="text-xs text-gray-400">{d.location.country}</span>
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 px-5 py-2">
                        <Link href="/destinations" onClick={() => setOpenNav(null)}
                          className="text-sm font-semibold text-blue-700 hover:underline">
                          View All Destinations →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>

            {/* Nepal ── two-panel mega */}
            <li
              className="relative"
              onMouseEnter={() => enterNav("Nepal")}
              onMouseLeave={leaveNav}
            >
              <button className={`flex items-center gap-1 px-4 py-5 text-sm font-medium transition ${openNav === "Nepal" ? "text-blue-700" : "text-gray-700 hover:text-blue-700"}`}>
                Nepal
                <FiChevronDown size={13} className={`transition-transform ${openNav === "Nepal" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {openNav === "Nepal" && (
                <div
                  className="absolute left-0 top-full z-50 flex overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl"
                  style={{ width: 760 }}
                  onMouseEnter={() => enterNav("Nepal")}
                  onMouseLeave={leaveNav}
                >
                  {/* Left: category list */}
                  <div className="w-56 flex-shrink-0 border-r border-gray-100 py-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.label}
                        onMouseEnter={() => hoverCategory(cat)}
                        onClick={() => { router.push(`/packages?search=${cat.query}`); setOpenNav(null); }}
                        className={`flex w-full items-center justify-between px-5 py-3 text-left text-sm transition ${
                          activeCategory === cat.label
                            ? "bg-blue-700 font-semibold text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cat.label}
                        <FiChevronRight size={13} className={activeCategory === cat.label ? "text-white" : "text-gray-400"} />
                      </button>
                    ))}
                  </div>

                  {/* Right: real packages for active category */}
                  <div className="flex-1 overflow-hidden p-6">
                    <h3 className="mb-4 truncate text-base font-bold text-blue-700">{activeCategory}</h3>
                    {pkgLoading && activePackages.length === 0 ? (
                      <div className="space-y-2">
                        {[1,2,3,4].map(i => <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />)}
                      </div>
                    ) : activePackages.length === 0 ? (
                      <p className="text-sm text-gray-400">No packages found.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {activePackages.map(pkg => (
                          <Link
                            key={pkg._id}
                            href={`/packages/${pkg.slug}`}
                            onClick={() => setOpenNav(null)}
                            className="border-b border-gray-100 py-2 text-sm text-gray-700 transition hover:text-blue-700 line-clamp-1"
                          >
                            -{pkg.title}{pkg.duration?.days ? ` – ${pkg.duration.days} days` : ""}
                          </Link>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/packages?search=${activeCat.query}`}
                      onClick={() => setOpenNav(null)}
                      className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
                    >
                      View All {activeCategory} →
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* Company */}
            <li
              className="relative"
              onMouseEnter={() => enterNav("Company")}
              onMouseLeave={leaveNav}
            >
              <button className={`flex items-center gap-1 px-4 py-5 text-sm font-medium transition ${openNav === "Company" ? "text-blue-700" : "text-gray-700 hover:text-blue-700"}`}>
                Company
                <FiChevronDown size={13} className={`transition-transform ${openNav === "Company" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {openNav === "Company" && (
                <div
                  className="absolute left-0 top-full z-50 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-2xl"
                  onMouseEnter={() => enterNav("Company")}
                  onMouseLeave={leaveNav}
                >
                  {COMPANY_LINKS.map(l => (
                    <Link key={l.href} href={l.href} onClick={() => setOpenNav(null)}
                      className="block px-5 py-2.5 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {/* Packages */}
            <li>
              <Link href="/packages" className="flex items-center gap-1 px-4 py-5 text-sm font-medium text-gray-700 hover:text-blue-700 transition">
                Packages
              </Link>
            </li>

          </ul>
        </nav>

        {/* ── Right ────────────────────────────────────────────── */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-3">

          {/* Phone */}
          <a href="tel:+97798510653"
            className="hidden flex-col items-end lg:flex">
            <span className="text-[10px] font-semibold text-blue-600">Call Us Now</span>
            <span className="text-sm font-bold text-gray-800">+977 9841 234 567</span>
          </a>
          <div className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 lg:flex">
            <FiPhone size={14} className="text-blue-700" />
          </div>

          {/* Auth */}
          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-gray-100" />
          ) : displayUser ? (
            <>
              <Link href="/dashboard/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition">
                <FiBell size={16} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </Link>
              <div ref={userRef} className="relative">
                <button onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100 transition">
                  {displayUser.image ? (
                    <Image src={displayUser.image} alt="" width={30} height={30} className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                      {displayUser.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium text-gray-800 md:block">{displayUser.name?.split(" ")[0]}</span>
                  <FiChevronDown size={12} className={`hidden text-gray-400 transition-transform md:block ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-gray-900">{displayUser.name}</p>
                      <p className="truncate text-xs text-gray-400">{displayUser.email}</p>
                    </div>
                    <Link href={dashboardHref} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                      <FiUser size={14} className="text-gray-400" /> Dashboard
                    </Link>
                    <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                      <FiSettings size={14} className="text-gray-400" /> Settings
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                      <FiLogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-blue-700 px-6 py-2 text-sm font-bold text-white shadow transition hover:bg-blue-800">
              Login
            </Link>
          )}

          {/* Hamburger */}
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition lg:hidden"
            onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-gray-100 bg-white px-6 py-4 lg:hidden">
          <nav className="space-y-0.5">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">Home</Link>
            <Link href="/destinations" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">Destinations</Link>
            <Link href="/packages" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">Packages</Link>

            <p className="px-3 pt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nepal</p>
            {CATEGORIES.slice(0, 5).map(m => (
              <Link key={m.label} href={`/packages?search=${m.query}`} onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {m.label}
              </Link>
            ))}

            <p className="px-3 pt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Company</p>
            {COMPANY_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {l.label}
              </Link>
            ))}
          </nav>

          <a href="tel:+97798510653" className="mt-4 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600">
            <FiPhone size={14} className="text-blue-600" /> +977 9841 234 567
          </a>

          <div className="mt-3 border-t border-gray-100 pt-3">
            {displayUser ? (
              <div className="space-y-1">
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <FiUser size={14} className="text-gray-400" /> Dashboard
                </Link>
                <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50">
                  <FiLogOut size={14} /> Sign out
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="block rounded-xl bg-blue-700 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-800">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
