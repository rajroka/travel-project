"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import {
  MapPinIcon,
  ArrowLeft01Icon,
  HeartAddIcon,
  HeartCheckIcon,
  Calendar03Icon,
  ArrowRight01Icon,
} from "hugeicons-react";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  coverImage?: string;
  images?: string[];
  location: { address?: string; city: string; country: string };
  bestSeason?: string[];
  highlights?: string[];
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
}

interface Package {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
}

export default function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [dest, setDest] = useState<Destination | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/destinations/${slug}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setDest(j.data.destination);
          if (j.data.destination._id) {
            fetch(`/api/packages?destination=${j.data.destination._id}&limit=3`)
              .then(r => r.json())
              .then(pj => { if (pj.success) setPackages(pj.data.packages); });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  async function toggleFav() {
    if (!dest || favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await fetch(`/api/favorites/${dest._id}`, { method: "DELETE", credentials: "include" });
        setIsFav(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ destinationId: dest._id }),
        });
        setIsFav(true);
      }
    } catch { /* ignore */ }
    setFavLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-4">
          <div className="h-80 animate-pulse rounded-3xl bg-gray-200" />
          <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
          <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-500">Destination not found.</p>
        <Link href="/destinations" className="text-sm text-blue-600 hover:underline">Browse all destinations</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-8">

        <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft01Icon size={16} /> All Destinations
        </button>

        {/* Hero */}
        <div className="relative mb-8 h-72 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-200 sm:h-96">
          {dest.coverImage && (
            <Image src={dest.coverImage} alt={dest.name} fill className="object-cover" sizes="100vw" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={toggleFav} disabled={favLoading} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white disabled:opacity-60">
            {isFav ? <HeartCheckIcon size={20} className="text-red-500" /> : <HeartAddIcon size={20} className="text-gray-500" />}
          </button>
          <div className="absolute bottom-0 left-0 p-8">
            {dest.isFeatured && (
              <span className="mb-2 inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-white">★ Featured</span>
            )}
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{dest.name}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/80">
              <span className="flex items-center gap-1"><MapPinIcon size={13} />{dest.location.city}, {dest.location.country}</span>
              {dest.averageRating > 0 && (
                <span className="flex items-center gap-1"><FaStar size={11} className="text-amber-400" />{dest.averageRating.toFixed(1)} ({dest.totalReviews})</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-900">About {dest.name}</h2>
              <p className="leading-7 text-gray-600">{dest.description}</p>
            </div>

            {(dest.highlights ?? []).length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold text-gray-900">Highlights</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {dest.highlights!.map(h => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-blue-500">★</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {packages.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Tour Packages</h2>
                  <Link href={`/packages?destination=${dest._id}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    View all <ArrowRight01Icon size={14} />
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {packages.map(pkg => (
                    <Link key={pkg._id} href={`/packages/${pkg.slug}`} className="group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition hover:border-blue-200 hover:bg-blue-50">
                      <div className="relative h-28 bg-gradient-to-br from-green-100 to-teal-200">
                        {pkg.coverImage && <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" sizes="200px" />}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{pkg.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{pkg.duration.days}D · ${pkg.discountPrice ?? pkg.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Quick Info</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2"><MapPinIcon size={15} className="text-blue-500" />{dest.location.city}, {dest.location.country}</div>
                {(dest.bestSeason ?? []).length > 0 && (
                  <div className="flex items-start gap-2">
                    <Calendar03Icon size={15} className="mt-0.5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Best Season</p>
                      <p className="text-gray-500">{dest.bestSeason!.join(", ")}</p>
                    </div>
                  </div>
                )}
              </div>
              <Link href={`/packages?destination=${dest._id}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">
                View Packages <ArrowRight01Icon size={15} />
              </Link>
              <button onClick={toggleFav} disabled={favLoading} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition disabled:opacity-50 ${isFav ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {isFav ? <HeartCheckIcon size={16} /> : <HeartAddIcon size={16} />}
                {isFav ? "Saved to Favourites" : "Save to Favourites"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
