"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import {
  Search01Icon,
  MapPinIcon,
  Clock01Icon,
  Location01Icon,
} from "hugeicons-react";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  location: { city: string; country: string };
  averageRating: number;
  totalReviews: number;
  shortDescription?: string;
  bestSeason?: string[];
}

interface Package {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
  averageRating: number;
  totalReviews: number;
  destination?: { name: string };
}

type TabType = "all" | "destination" | "package";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(q);
  const [inputVal, setInputVal] = useState(q);
  const [tab, setTab] = useState<TabType>("all");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (searchQuery: string, type: TabType) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const url = `/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}&limit=12`;
      const res = await fetch(url);
      const json = await res.json() as {
        success: boolean;
        data: { destinations?: Destination[]; packages?: Package[] };
      };
      if (json.success) {
        setDestinations(json.data.destinations ?? []);
        setPackages(json.data.packages ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync URL param → local state + run search whenever q changes
  useEffect(() => {
    if (q) {
      setQuery(q);
      setInputVal(q);
      doSearch(q, tab);
    } else {
      setQuery("");
      setInputVal("");
      setDestinations([]);
      setPackages([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Re-run when tab changes (only if a query exists)
  useEffect(() => {
    if (query) doSearch(query, tab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!inputVal.trim()) return;
    // Push to URL — the useEffect on `q` will pick it up and run the search
    router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
  }

  const totalResults = destinations.length + packages.length;

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search destinations, packages…"
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-gray-800 outline-none shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-blue-700 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Search
          </button>
        </form>

        {/* Tabs */}
        {query && (
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              {(["all", "destination", "package"] as TabType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                    tab === t ? "bg-blue-700 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t === "all" ? "All" : t === "destination" ? "Destinations" : "Packages"}
                </button>
              ))}
            </div>
            {!loading && (
              <p className="text-sm text-gray-400">
                {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;
                <span className="font-medium text-gray-700">{query}</span>&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        )}

        {/* Empty state — no query */}
        {!query && !loading && (
          <div className="flex flex-col items-center py-20 text-center">
            <Search01Icon size={56} className="mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700">Search for destinations or packages</h2>
            <p className="mt-2 text-gray-400">Type something above to get started.</p>
          </div>
        )}

        {/* Empty state — no results */}
        {!loading && query && totalResults === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Search01Icon size={56} className="mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700">No results found</h2>
            <p className="mt-2 text-gray-400">
              Try a different keyword or{" "}
              <Link href="/destinations" className="text-blue-600 hover:underline">
                browse all destinations
              </Link>.
            </p>
          </div>
        )}

        {/* Destinations */}
        {!loading && destinations.length > 0 && (tab === "all" || tab === "destination") && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Destinations <span className="text-sm font-normal text-gray-400">({destinations.length})</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((d) => (
                <Link
                  key={d._id}
                  href={`/destinations/${d.slug}`}
                  className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {d.coverImage ? (
                      <Image src={d.coverImage} alt={d.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="33vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <MapPinIcon size={48} className="text-blue-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="break-words text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {d.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} size={12} className={d.averageRating >= star ? "text-amber-400" : "text-gray-300"} />
                      ))}
                      {d.averageRating > 0 && (
                        <span className="text-sm text-gray-500">
                          {d.totalReviews} {d.totalReviews === 1 ? 'review' : 'reviews'}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPinIcon size={14} className="flex-shrink-0 text-gray-500" />
                      <span className="truncate">{d.location.city}, {d.location.country}</span>
                    </div>

                    <p className="mt-1.5 min-h-[40px] text-sm text-gray-500 line-clamp-2">
                      {d.shortDescription ?? `Explore the breathtaking beauty of ${d.name}.`}
                    </p>

                    {d.bestSeason && d.bestSeason.length > 0 && (
                      <p className="mt-2 truncate text-xs text-gray-400">
                        Best in {d.bestSeason.slice(0, 2).join(" & ")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Packages */}
        {!loading && packages.length > 0 && (tab === "all" || tab === "package") && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Tour Packages <span className="text-sm font-normal text-gray-400">({packages.length})</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <Link
                  key={p._id}
                  href={`/packages/${p.slug}`}
                  className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {p.coverImage ? (
                      <Image src={p.coverImage} alt={p.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="33vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Clock01Icon size={48} className="text-green-300" />
                      </div>
                    )}
                    {p.discountPrice && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">Sale</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="break-words text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {p.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} size={12} className={p.averageRating >= star ? "text-amber-400" : "text-gray-300"} />
                      ))}
                      {p.averageRating > 0 && (
                        <span className="text-sm text-gray-500">
                          {p.totalReviews} {p.totalReviews === 1 ? 'review' : 'reviews'}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock01Icon size={14} className="flex-shrink-0 text-gray-500" />
                      <span className="truncate">Duration: {p.duration.days} days</span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="text-gray-500">Starting From:</span>
                      {p.discountPrice ? (
                        <>
                          <span className="font-bold text-gray-900">USD {p.discountPrice}</span>
                          <span className="text-xs text-gray-400 line-through">USD {p.price}</span>
                        </>
                      ) : (
                        <span className="font-bold text-gray-900">USD {p.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </>
  );
}
