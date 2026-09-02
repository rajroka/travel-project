"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { MapPinIcon, ArrowRight01Icon } from "hugeicons-react";

const FALLBACK = [
  "/pexels-tkirkgoz-4750098.jpg",
  "/pexels-roman-saienko-1867764487-28831413.jpg",
  "/pexels-mr-dr3igeteilt-2159455987-36564643.jpg",
  "/gumba.jpg",
  "/hero-image.jpg",
];

interface Dest {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  shortDescription?: string;
  location: { city: string; country: string };
  averageRating: number;
  totalReviews: number;
  bestSeason?: string[];
}

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="h-56 animate-pulse bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
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

export default function FeaturedDestinations() {
  const [destinations, setDestinations] = useState<Dest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch("/api/destinations?featured=true&limit=4", { signal: controller.signal })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data.destinations.length > 0) {
          setDestinations(json.data.destinations);
          setLoading(false);
        } else {
          // Fallback fetch
          return fetch("/api/destinations?limit=4", { signal: controller.signal })
            .then(r => r.json())
            .then(j => { 
              if (j.success) setDestinations(j.data.destinations);
              setLoading(false);
            });
        }
      })
      .catch(err => { 
        if (err.name !== 'AbortError') console.error(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (!loading && destinations.length === 0) return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Featured Destinations</h2>
        <p className="mt-4 text-gray-400">No destinations available yet. Check back soon.</p>
      </div>
    </section>
  );

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Featured Destinations
          </h2>
          <p className="mt-3 text-gray-500">
            Nepal&apos;s most loved travel destinations, handpicked for you.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
            : destinations.map((place, i) => {
                const isRealPhoto = place.coverImage &&
                  !place.coverImage.includes("Nepal.png") &&
                  !place.coverImage.includes("nepal.png");
                const photo = isRealPhoto ? place.coverImage! : FALLBACK[i % FALLBACK.length];
                return (
                  <Link
                    key={place._id}
                    href={`/destinations/${place.slug}`}
                    className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <Image
                        src={photo}
                        alt={place.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                      />

                    </div>

                    <div className="p-4">
                      <h3 className="break-words text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {place.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-1.5">
                        <Stars rating={place.averageRating > 0 ? place.averageRating : 0} />
                        {place.averageRating > 0 && (
                          <span className="text-sm text-gray-500">
                            {place.totalReviews} {place.totalReviews === 1 ? 'review' : 'reviews'}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPinIcon size={14} className="flex-shrink-0 text-gray-500" />
                        <span className="truncate">{place.location.city}, {place.location.country}</span>
                      </div>

                      <p className="mt-1.5 min-h-[40px] text-sm text-gray-500 line-clamp-2">
                        {place.shortDescription ?? `Explore the breathtaking beauty of ${place.name}.`}
                      </p>

                      {place.bestSeason && place.bestSeason.length > 0 && (
                        <p className="mt-2 truncate text-xs text-gray-400">
                          Best in {place.bestSeason.slice(0, 2).join(" & ")}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-700 px-8 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-700 hover:text-white"
          >
            View all destinations <ArrowRight01Icon size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
