"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import {
  Search01Icon,
  Clock01Icon,
  UserGroupIcon,
  Location01Icon,
  Tag01Icon,
  FilterIcon,
  ArrowRight01Icon,
} from "hugeicons-react";

interface Package {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
  maxTravelers: number;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  isPromotional: boolean;
  difficultyLevel?: string;
  destination?: { name: string; slug: string; location: { city: string } };
  includedServices: string[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Category { _id: string; name: string; slug: string }

function PackageSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="h-48 animate-pulse bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

function PackagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter state
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [minDays, setMinDays] = useState(searchParams.get("minDays") ?? "");
  const [maxDays, setMaxDays] = useState(searchParams.get("maxDays") ?? "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") ?? "");
  const [promotional, setPromotional] = useState(searchParams.get("promotional") === "true");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [packages, setPackages] = useState<Package[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPackages = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "12");
    params.set("page", String(page));
    params.set("sort", sort);
    if (search) params.set("search", search);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minDays) params.set("minDays", minDays);
    if (maxDays) params.set("maxDays", maxDays);
    if (difficulty) params.set("difficulty", difficulty);
    if (promotional) params.set("promotional", "true");

    fetch(`/api/packages?${params}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setPackages(j.data.packages);
          setPagination(j.data.pagination);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, sort, minPrice, maxPrice, minDays, maxDays, difficulty, promotional, page]);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchPackages();
  }

  function clearFilters() {
    setSearch(""); setMinPrice(""); setMaxPrice("");
    setMinDays(""); setMaxDays(""); setDifficulty("");
    setPromotional(false); setSort("newest"); setPage(1);
  }

  const hasActiveFilters = search || minPrice || maxPrice || minDays || maxDays || difficulty || promotional;

  return (
    <>
      <div className="min-h-screen bg-gray-50">

        {/* ── Hero banner ─────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 text-white">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-300">
              Curated Experiences
            </p>
            <h1 className="text-4xl font-extrabold md:text-5xl">Tour Packages</h1>
            <p className="mx-auto mt-4 max-w-2xl text-blue-200">
              Handcrafted itineraries across Nepal — from Everest treks to jungle safaris.
              Find your perfect adventure.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-3">
              <div className="relative flex-1">
                <Search01Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search packages…"
                  className="h-12 w-full rounded-xl border-0 pl-11 pr-4 text-sm text-gray-800 shadow-lg outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button type="submit" className="rounded-xl bg-blue-500 px-6 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-600">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* ── Main content ────────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 lg:flex-row">

            {/* ── Filter sidebar ──────────────────────────────────────── */}
            <aside className={`lg:w-60 flex-shrink-0 space-y-6 ${filtersOpen ? "block" : "hidden lg:block"}`}>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                      Clear all
                    </button>
                  )}
                </div>

                {/* Price range */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Price (USD)</p>
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="Min" value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <input
                      type="number" placeholder="Max" value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Duration (Days)</p>
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="Min" value={minDays}
                      onChange={(e) => { setMinDays(e.target.value); setPage(1); }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <input
                      type="number" placeholder="Max" value={maxDays}
                      onChange={(e) => { setMaxDays(e.target.value); setPage(1); }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Difficulty</p>
                  <div className="space-y-1.5">
                    {["", "easy", "moderate", "challenging"].map((d) => (
                      <label key={d} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
                        <input
                          type="radio" name="difficulty" value={d}
                          checked={difficulty === d}
                          onChange={() => { setDifficulty(d); setPage(1); }}
                          className="accent-blue-600"
                        />
                        {d === "" ? "All levels" : d.charAt(0).toUpperCase() + d.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Promotional */}
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
                  <input
                    type="checkbox" checked={promotional}
                    onChange={(e) => { setPromotional(e.target.checked); setPage(1); }}
                    className="accent-blue-600"
                  />
                  <span className="flex items-center gap-1.5">
                    <Tag01Icon size={14} className="text-red-500" /> On Sale only
                  </span>
                </label>
              </div>
            </aside>

            {/* ── Package grid ────────────────────────────────────────── */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFiltersOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
                  >
                    <FilterIcon size={15} /> Filters
                    {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                  </button>
                  {pagination && (
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">{pagination.total}</span> packages
                    </p>
                  )}
                </div>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-400 shadow-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => <PackageSkeleton key={i} />)}
                </div>
              ) : packages.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-sm">
                  <Search01Icon size={52} className="mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700">No packages found</h3>
                  <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
                  <button onClick={clearFilters} className="mt-4 rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {packages.map((pkg) => (
                    <Link
                      key={pkg._id}
                      href={`/packages/${pkg.slug}`}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gray-100">
                        {pkg.coverImage ? (
                          <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width:640px) 100vw, 33vw" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Location01Icon size={48} className="text-green-300" />
                          </div>
                        )}
                        {pkg.isPromotional && (
                          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                            <Tag01Icon size={11} /> SALE
                          </span>
                        )}
                        {pkg.difficultyLevel && (
                          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium capitalize text-white">
                            {pkg.difficultyLevel}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5">
                        <h3 className="line-clamp-2 font-semibold text-gray-900 leading-snug">{pkg.title}</h3>

                        {pkg.destination && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                            <Location01Icon size={13} className="text-blue-400" />
                            {pkg.destination.name}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock01Icon size={13} className="text-blue-400" />
                            {pkg.duration.days}D / {pkg.duration.nights}N
                          </span>
                          <span className="flex items-center gap-1.5">
                            <UserGroupIcon size={13} className="text-blue-400" />
                            Max {pkg.maxTravelers}
                          </span>
                          {pkg.averageRating > 0 && (
                            <span className="flex items-center gap-1 text-amber-500">
                              <FaStar size={11} />
                              {pkg.averageRating.toFixed(1)}
                              <span className="text-gray-400">({pkg.totalReviews})</span>
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                          <div>
                            {pkg.discountPrice ? (
                              <>
                                <span className="text-xl font-bold text-blue-700">${pkg.discountPrice}</span>
                                <span className="ml-1.5 text-xs text-gray-400 line-through">${pkg.price}</span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-blue-700">${pkg.price}</span>
                            )}
                            <span className="text-xs text-gray-400"> / person</span>
                          </div>
                          <span className="flex items-center gap-1 rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-blue-800 transition">
                            View <ArrowRight01Icon size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
                    {page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-400">Loading packages…</div>}>
      <PackagesContent />
    </Suspense>
  );
}
