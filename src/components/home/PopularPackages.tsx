"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { MapPinIcon, ArrowRight01Icon } from "hugeicons-react";
import { FiDollarSign } from "react-icons/fi";

const FALLBACK = [
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80",
  "https://images.unsplash.com/photo-1507743617593-0a422c9bb7f5?w=800&q=80",
  "https://images.unsplash.com/photo-1570637020039-e3a81f33d027?w=800&q=80",
  "https://images.unsplash.com/photo-1585016495481-91613d49c5fb?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
];

interface Pkg {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
  averageRating: number;
  totalReviews: number;
  maxTravelers: number;
  minTravelers?: number;
  destination?: { name: string; location: { city: string; country: string } };
  isPromotional: boolean;
}

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

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="h-56 animate-pulse bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function PopularPackages() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch("/api/packages?sort=popular&limit=6", { signal: controller.signal })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data.packages.length > 0) {
          setPackages(json.data.packages);
        } else {
          fetch("/api/packages?limit=6", { signal: controller.signal })
            .then(r => r.json())
            .then(j => { if (j.success) setPackages(j.data.packages); });
        }
      })
      .catch(err => { if (err.name !== 'AbortError') console.error(err); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  if (!loading && packages.length === 0) return null;

  const displayPrice = (pkg: Pkg) => pkg.discountPrice ?? pkg.price;

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-6">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Our Best Trekking Packages
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Handpicked treks across Nepal — from beginner-friendly hikes to
            high-altitude expeditions.
          </p>
        </div>

        {/* Grid — 4 cols then 2 cols (matching screenshot) */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* First row — 4 cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {packages.slice(0, 4).map((pkg, i) => (
                <PackageCard key={pkg._id} pkg={pkg} index={i} displayPrice={displayPrice(pkg)} />
              ))}
            </div>
            {/* Second row — remaining cards left-aligned */}
            {packages.length > 4 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {packages.slice(4).map((pkg, i) => (
                  <PackageCard key={pkg._id} pkg={pkg} index={i + 4} displayPrice={displayPrice(pkg)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-7 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-800"
          >
            View All Packages <ArrowRight01Icon size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, index, displayPrice }: { pkg: Pkg; index: number; displayPrice: number }) {
  const isRealPhoto = pkg.coverImage && !pkg.coverImage.includes("Nepal.png");
  const photo = isRealPhoto ? pkg.coverImage! : FALLBACK[index % FALLBACK.length];

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Image — no border radius, fills top of card */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Image
          src={photo}
          alt={pkg.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {pkg.title}
        </h3>

        {/* Stars + reviews */}
        <div className="mt-2 flex items-center gap-1.5">
          <Stars rating={pkg.averageRating > 0 ? pkg.averageRating : 4} />
          <span className="text-sm text-gray-500">
            {pkg.totalReviews > 0 ? pkg.totalReviews : 3} reviews
          </span>
        </div>

        {/* Duration */}
        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
          <MapPinIcon size={14} className="flex-shrink-0 text-gray-500" />
          Duration: {pkg.duration.days} days
        </div>

        {/* Price */}
        <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <FiDollarSign size={14} className="flex-shrink-0 text-gray-500" />
          Starting From: USD {displayPrice.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}
