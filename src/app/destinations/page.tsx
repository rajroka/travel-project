"use client";

import { useEffect, useState, useCallback } from "react";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaStar } from "react-icons/fa";
import {
  Search01Icon,
  MapPinIcon,
  HeartAddIcon,
  HeartCheckIcon,
  FilterIcon,
  ArrowRight01Icon,
} from "hugeicons-react";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  shortDescription?: string;
  location: { city: string; country: string };
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  bestSeason?: string[];
}

interface Pagination { total: number; page: number; limit: number; totalPages: number }

function DestinationsContent() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [featured, setFeatured] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchDestinations = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "12");
    params.set("page", String(page));
    params.set("sort", sort);
    if (search) params.set("search", search);
    if (country) params.set("country", country);
    if (featured) params.set("featured", "true");

    fetch(`/api/destinations?${params}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setDestinations(j.data.destinations);
          setPagination(j.data.pagination);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, country, featured, sort, page]);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchDestinations();
  }

  function clearFilters() {
    setSearch(""); setCountry(""); setFeatured(false); setSort("newest"); setPage(1);
  }

  async function toggleFavorite(id: string, e: React.MouseEvent) {
    e.preventDefault();
    const isFav = favorites.has(id);
    const newFavs = new Set(favorites);
    if (isFav) {
      await fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ destinationId: id }) });
      newFavs.delete(id);
    } else {
      await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ destinationId: id }) });
      newFavs.add(id);
    }
    setFavorites(newFavs);
  }

  const hasFilters = search || country || featured;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-16 text-white">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-300">
              Explore Nepal
            </p>
            <h1 className="text-4xl font-extrabold md:text-5xl">Destinations</h1>
            <p className="mx-auto mt-4 max-w-xl text-blue-200">
              From the world&apos;s highest peaks to lush jungles — discover Nepal&apos;s
              most incredible destinations.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-3">
              <div className="relative flex-1">
                <Search01Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search destinations…"
                  className="h-12 w-full rounded-xl border-0 pl-11 pr-4 text-sm text-gray-800 shadow-lg outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button type="submit" className="rounded-xl bg-blue-500 px-6 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-600">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* ── Main ────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 lg:flex-row">

            {/* ── Filter sidebar ──────────────────────────────────────── */}
            <aside className={`lg:w-56 flex-shrink-0 space-y-5 ${filtersOpen ? "block" : "hidden lg:block"}`}>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear</button>
                  )}
                </div>

                {/* Country */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Country</p>
                  <input
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                    placeholder="e.g. Nepal"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>

                {/* Featured */}
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
                  <input
                    type="checkbox" checked={featured}
                    onChange={(e) => { setFeatured(e.target.checked); setPage(1); }}
                    className="accent-blue-600"
                  />
                  ★ Featured only
                </label>
              </div>
            </aside>

            {/* ── Destination grid ────────────────────────────────────── */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFiltersOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
                  >
                    <FilterIcon size={15} /> Filters
                    {hasFilters && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                  </button>
                  {pagination && (
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">{pagination.total}</span> destinations
                    </p>
                  )}
                </div>

                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-blue-400"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">A → Z</option>
                </select>
              </div>

              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <div className="h-48 animate-pulse bg-gray-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : destinations.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-sm">
                  <MapPinIcon size={52} className="mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700">No destinations found</h3>
                  <button onClick={clearFilters} className="mt-4 rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {destinations.map((d) => (
                    <Link
                      key={d._id}
                      href={`/destinations/${d.slug}`}
                      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200">
                        {d.coverImage ? (
                          <Image src={d.coverImage} alt={d.name} fill className="object-cover transition group-hover:scale-105" sizes="33vw" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <MapPinIcon size={48} className="text-blue-300" />
                          </div>
                        )}
                        {d.isFeatured && (
                          <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-white">★ Featured</span>
                        )}
                        {/* Fav button */}
                        <button
                          onClick={(e) => toggleFavorite(d._id, e)}
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
                        >
                          {favorites.has(d._id)
                            ? <HeartCheckIcon size={16} className="text-red-500" />
                            : <HeartAddIcon size={16} className="text-gray-400" />
                          }
                        </button>
                      </div>

                      {/* Body */}
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900">{d.name}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                          <MapPinIcon size={13} className="text-blue-400" />
                          {d.location.city}, {d.location.country}
                        </p>
                        {d.shortDescription && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{d.shortDescription}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          {d.averageRating > 0 ? (
                            <span className="flex items-center gap-1 text-sm">
                              <FaStar size={12} className="text-amber-400" />
                              <span className="font-medium text-gray-800">{d.averageRating.toFixed(1)}</span>
                              <span className="text-gray-400">({d.totalReviews})</span>
                            </span>
                          ) : <span />}
                          <span className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:underline">
                            Explore <ArrowRight01Icon size={14} />
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
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40">
                    ← Prev
                  </button>
                  <span className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
                    {page} / {pagination.totalPages}
                  </span>
                  <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40">
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-400">Loading destinations…</div>}>
      <DestinationsContent />
    </Suspense>
  );
}
