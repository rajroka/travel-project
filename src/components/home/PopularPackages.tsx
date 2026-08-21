"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { Clock01Icon, UserGroupIcon, ArrowRight01Icon, Location01Icon, Tag01Icon } from "hugeicons-react";

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
  maxTravelers: number;
  destination?: { name: string; location: { city: string } };
  isPromotional: boolean;
}

function PackageSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="h-60 animate-pulse bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

export default function PopularPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages?sort=popular&limit=3&active=true")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.packages.length > 0) {
          setPackages(json.data.packages);
        } else {
          return fetch("/api/packages?limit=3&active=true")
            .then((r) => r.json())
            .then((j) => { if (j.success) setPackages(j.data.packages); });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900">Popular Tour Packages</h2>
          <p className="mt-3 text-gray-500">Choose from our most loved travel experiences.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <PackageSkeleton key={i} />)
            : packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative h-60 bg-gradient-to-br from-green-100 to-teal-200">
                    {pkg.coverImage ? (
                      <Image
                        src={pkg.coverImage}
                        alt={pkg.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Location01Icon className="text-green-300" size={48} />
                      </div>
                    )}
                    {pkg.isPromotional && (
                      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
                        <Tag01Icon size={12} /> Sale
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
                        {pkg.title}
                      </h3>
                      {pkg.averageRating > 0 && (
                        <div className="flex flex-shrink-0 items-center gap-1 text-yellow-500">
                          <FaStar size={13} />
                          <span className="text-sm font-medium text-gray-700">{pkg.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {pkg.destination && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                        <Location01Icon size={14} className="text-blue-400" />
                        {pkg.destination.name}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-5 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock01Icon size={16} className="text-blue-500" />
                        {pkg.duration.days}D / {pkg.duration.nights}N
                      </span>
                      <span className="flex items-center gap-1.5">
                        <UserGroupIcon size={16} className="text-blue-500" />
                        Max {pkg.maxTravelers}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        {pkg.discountPrice ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-gray-900">${pkg.discountPrice}</span>
                            <span className="text-sm text-gray-400 line-through">${pkg.price}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">${pkg.price}</span>
                        )}
                        <span className="text-xs text-gray-400">/ person</span>
                      </div>

                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                      >
                        View <ArrowRight01Icon size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-700 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Browse all packages <ArrowRight01Icon size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
