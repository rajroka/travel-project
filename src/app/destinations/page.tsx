"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import {
  Search01Icon,
  MapPinIcon,
  HeartAddIcon,
  HeartCheckIcon,
  ArrowRight01Icon,
  FilterIcon,
  Cancel01Icon,
} from "hugeicons-react";

const FALLBACK = [
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
  "https://images.unsplash.com/photo-1507743617593-0a422c9bb7f5?w=800&q=80",
  "https://images.unsplash.com/photo-1570637020039-e3a81f33d027?w=800&q=80",
  "https://images.unsplash.com/photo-1585016495481-91613d49c5fb?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
];

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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <FaStar
          key={i}
          size={13}
          className={i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

function DestinationsContent() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
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
      .then(r => r.json())
      .then(j => {
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
    setSearch(searchInput);
    setPage(1);
  }

  function clearFilters() {
    setSearch(""); setSearchInput(""); setCountry(""); setFeatured(false); setSort("newest"); setPage(1);
  }

  async function toggleFavorite(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative h-64 overflow-hidden bg-blue-900 sm:h-72">
        <Image
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80"
          alt="Nepal destinations"
          fill
          className="object-cover opacity-40"
          sizes="100vw"
          priority
        />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-300">Explore Nepal</p>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Destinations</h1>
          <p className="mt-3 max-w-lg text-blue-200">
            From the world&apos;s highest peaks to lush jungles — discover Nepal&apos;s most breathtaking places.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-6 flex w-full max-w-lg gap-2">
            <div className="relative flex-1">
              <Search01Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search destinations…"
                className="h-11 w-full rounded-xl border-0 pl-10 pr-4 text-sm text-gray-900 shadow-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button type="submit" className="rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">

          {/* ── Sidebar filters ──────────────────────────────────────── */}
          <aside className={`lg:w-52 flex-shrink-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <div className="sticky top-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Cancel01Icon size={12} /> Clear
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Country</p>
                  <input
                    value={country}
                    onChange={e => { setCountry(e.target.value); setPage(1); }}
                    placeholder="e.g. Nepal"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Sort By</p>
                  <select
                    value={sort}
                    onChange={e => { setSort(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                    <option value="name">A → Z</option>
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                  <input
                    type="checkbox" checked={featured}
                    onChange={e => { setFeatured(e.target.checked); setPage(1); }}
                    className="accent-blue-600"
                  />
                  ★ Featured only
                </label>
              </div>
            </div>
          </aside>

          {/* ── Grid ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 lg:hidden"
                >
                  <FilterIcon size={14} /> Filters
                  {hasFilters && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                </button>
                {pagination && (
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{pagination.total}</span> destinations
                  </p>
                )}
              </div>
              {/* Active filters chips */}
              <div className="flex flex-wrap gap-2">
                {search && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}><Cancel01Icon size={11} /></button>
                  </span>
                )}
                {country && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {country}
                    <button onClick={() => { setCountry(""); setPage(1); }}><Cancel01Icon size={11} /></button>
                  </span>
                )}
                {featured && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                    ★ Featured
                    <button onClick={() => { setFeatured(false); setPage(1); }}><Cancel01Icon size={11} /></button>
                  </span>
                )}
              </div>
            </div>

            {/* Cards */}
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="h-56 animate-pulse bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : destinations.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-sm">
                <MapPinIcon size={52} className="mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700">No destinations found</h3>
                <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
                <button onClick={clearFilters} className="mt-4 rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {destinations.map((d, i) => {
                  const isRealPhoto = d.coverImage && !d.coverImage.includes("Nepal.png");
                  const photo = isRealPhoto ? d.coverImage! : FALLBACK[i % FALLBACK.length];

                  return (
                    <article key={d._id} className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md">
                      <Link href={`/destinations/${d.slug}`} className="block">
                        <div className="relative h-56 overflow-hidden bg-gray-100">
                          <Image
                            src={photo}
                            alt={d.name}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
                          />
                          {d.isFeatured && (
                            <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                            {d.name}
                          </h3>
                          <div className="mt-2 flex items-center gap-1.5">
                            <Stars rating={d.averageRating > 0 ? d.averageRating : 4} />
                            <span className="text-sm text-gray-500">
                              {d.totalReviews > 0 ? d.totalReviews : 3} reviews
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPinIcon size={14} className="flex-shrink-0 text-gray-500" />
                            <span className="truncate">{d.location.city}, {d.location.country}</span>
                          </div>
                          <p className="mt-1.5 min-h-[40px] text-sm text-gray-500 line-clamp-2">
                            {d.shortDescription ?? `Explore the breathtaking beauty of ${d.name}.`}
                          </p>
                          <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-blue-700 transition-all group-hover:gap-2">
                            Explore <ArrowRight01Icon size={14} />
                          </div>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={e => toggleFavorite(d._id, e)}
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
                        aria-label={favorites.has(d._id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        {favorites.has(d._id)
                          ? <HeartCheckIcon size={15} className="text-red-500" />
                          : <HeartAddIcon size={15} className="text-gray-500" />
                        }
                      </button>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-1 text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`min-w-[40px] rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          page === p
                            ? "border-blue-700 bg-blue-700 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
      </div>
    }>
      <DestinationsContent />
    </Suspense>
  );
}
