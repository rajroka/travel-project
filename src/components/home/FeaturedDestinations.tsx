"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { MapPinIcon, ArrowRight01Icon } from "hugeicons-react";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  shortDescription?: string;
  location: { city: string; country: string };
  averageRating: number;
  totalReviews: number;
}

function DestinationSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="h-64 animate-pulse bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

export default function FeaturedDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/destinations?featured=true&limit=4")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.destinations.length > 0) {
          setDestinations(json.data.destinations);
        } else {
          // Fallback to non-featured destinations if no featured ones exist yet
          return fetch("/api/destinations?limit=4")
            .then((r) => r.json())
            .then((j) => { if (j.success) setDestinations(j.data.destinations); });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900">Featured Destinations</h2>
          <p className="mt-4 text-gray-500">Discover Nepal&apos;s most loved travel destinations.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <DestinationSkeleton key={i} />)
            : destinations.map((place) => (
                <div
                  key={place._id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative h-64 bg-gradient-to-br from-blue-100 to-indigo-200">
                    {place.coverImage ? (
                      <Image
                        src={place.coverImage}
                        alt={place.name}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <MapPinIcon className="text-blue-300" size={48} />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
                      {place.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FaStar size={13} />
                          <span className="text-sm font-medium">{place.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPinIcon size={14} className="text-blue-500" />
                      <span>{place.location.city}, {place.location.country}</span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {place.shortDescription ?? `Explore the beauty of ${place.name}.`}
                    </p>

                    <Link
                      href={`/destinations/${place.slug}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                      Explore <ArrowRight01Icon size={16} />
                    </Link>
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-700 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            View all destinations <ArrowRight01Icon size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
