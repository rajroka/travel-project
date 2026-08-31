"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPinIcon, ArrowRight01Icon, UserGroupIcon } from "hugeicons-react";

// Nepal travel fallback images (Unsplash, free to use)
const FALLBACK = [
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&q=85", // Annapurna trek
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=900&q=85", // Everest base camp
  "https://images.unsplash.com/photo-1507743617593-0a422c9bb7f5?w=900&q=85", // Pokhara lake
  "https://images.unsplash.com/photo-1570637020039-e3a81f33d027?w=900&q=85", // Nepal temple
  "https://images.unsplash.com/photo-1585016495481-91613d49c5fb?w=900&q=85", // Himalaya
  "https://images.unsplash.com/photo-1432889490240-84df33d47091?w=900&q=85", // Mountain trail
];

interface Pkg {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
  maxTravelers: number;
  minTravelers?: number;
  destination?: { name: string; location: { city: string; country: string } };
  isPromotional: boolean;
  promotionExpiry?: string;
}

function Skeleton() {
  return (
    <div>
      <div className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-200" />
      <div className="mt-4 space-y-2 px-1">
        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-7 w-1/2 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

export default function PopularPackages() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active packages — fallback to any packages if none found
    fetch("/api/packages?sort=popular&limit=3")
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data.packages.length > 0) {
          setPackages(json.data.packages);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && packages.length === 0) return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">The Nepal Experience</h2>
        <p className="mt-4 text-gray-400">No packages available yet. Check back soon.</p>
      </div>
    </section>
  );

  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-6">

        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            The Nepal Experience
          </h2>
          <p className="mt-3 text-gray-500">
            Seamless planning, curated stays, and support at every step
          </p>
        </div>

        {/* 3-col grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)
            : packages.map((pkg, i) => {
                const savings   = pkg.discountPrice ? pkg.price - pkg.discountPrice : 0;
                const showPrice = pkg.discountPrice ?? pkg.price;
                // Use coverImage only if it's a real photo (not the logo placeholder)
                const isRealPhoto = pkg.coverImage &&
                  !pkg.coverImage.includes("Nepal.png") &&
                  !pkg.coverImage.includes("nepal.png");
                const photo = isRealPhoto ? pkg.coverImage! : FALLBACK[i % FALLBACK.length];
                const departs   = pkg.promotionExpiry
                  ? new Date(pkg.promotionExpiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : null;

                return (
                  <Link key={pkg._id} href={`/packages/${pkg.slug}`} className="group block">

                    {/* ── Image (fully rounded, badges inside) ── */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image
                        src={photo}
                        alt={pkg.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />

                      {/* days — top left */}
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
                        {pkg.duration.days} days
                      </span>

                      {/* group size — top right */}
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
                        <UserGroupIcon size={12} />
                        {pkg.minTravelers ?? 1}–{pkg.maxTravelers}s
                      </span>
                    </div>

                    {/* ── Text below image ── */}
                    <div className="mt-4 px-1">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {pkg.title}
                      </h3>

                      {/* Location */}
                      {pkg.destination && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                          <MapPinIcon size={14} />
                          <span className="truncate">
                            {pkg.destination.location.city}
                            {pkg.destination.location.city !== pkg.destination.name
                              ? ` to ${pkg.destination.name}` : ""}
                          </span>
                        </div>
                      )}

                      {/* Price row */}
                      <div className="mt-3 flex items-baseline flex-wrap gap-x-2 gap-y-1">
                        <span className="text-3xl font-extrabold text-gray-900">
                          ${showPrice.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-gray-400">USD</span>
                        {pkg.discountPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${pkg.price.toLocaleString()}
                          </span>
                        )}
                        {savings > 0 && (
                          <span className="rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-white">
                            SAVE ${savings}
                          </span>
                        )}
                      </div>

                      {/* Departs pill */}
                      <div className="mt-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600">
                          {/* truck icon inline SVG — matches screenshot exactly */}
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                          {departs ? `Departs on ${departs}` : `${pkg.duration.days}D / ${pkg.duration.nights}N trip`}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-8 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-blue-800"
          >
            Browse all packages <ArrowRight01Icon size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
