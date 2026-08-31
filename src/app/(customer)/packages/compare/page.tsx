"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckmarkCircle01Icon, Calendar03Icon, UserGroupIcon, ArrowRight01Icon } from "hugeicons-react";
import { FaStar } from "react-icons/fa";

interface Package {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
  maxTravelers: number;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  difficultyLevel?: string;
  includedServices: string[];
  highlights?: string[];
  coverImage?: string;
  destination?: { name: string };
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get("ids") ?? "";

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ids) return;
    setLoading(true);
    fetch(`/api/packages/compare?ids=${ids}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setPackages(j.data.packages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ids]);

  const allServices = Array.from(
    new Set(packages.flatMap((p) => p.includedServices))
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Compare Packages</h1>
        <Link href="/packages" className="text-sm text-blue-600 hover:underline">
          â† Browse all
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200" />)}
        </div>
      ) : packages.length < 2 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">Select at least 2 packages to compare.</p>
          <Link href="/packages" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            Browse packages
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <td className="w-36 pr-4" />
                {packages.map((p) => (
                  <th key={p._id} className="min-w-[220px] px-3 pb-4 text-left align-top">
                    <div className="relative mb-3 h-36 overflow-hidden rounded-2xl bg-gray-100">
                      {p.coverImage && (
                        <Image src={p.coverImage} alt={p.title} fill className="object-cover" sizes="220px" />
                      )}
                    </div>
                    <p className="font-bold text-gray-900 leading-snug">{p.title}</p>
                    {p.destination && <p className="mt-0.5 text-xs text-gray-400">{p.destination.name}</p>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Price */}
              <tr className="bg-gray-50">
                <td className="pr-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Price</td>
                {packages.map((p) => (
                  <td key={p._id} className="px-3 py-4">
                    {p.discountPrice ? (
                      <div>
                        <span className="text-lg font-bold text-blue-700">${p.discountPrice}</span>
                        <span className="ml-1 text-xs text-gray-400 line-through">${p.price}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-blue-700">${p.price}</span>
                    )}
                    <div className="text-xs text-gray-400">per person</div>
                  </td>
                ))}
              </tr>
              {/* Duration */}
              <tr>
                <td className="pr-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Duration</td>
                {packages.map((p) => (
                  <td key={p._id} className="px-3 py-4 font-medium">
                    {p.duration.days}D / {p.duration.nights}N
                  </td>
                ))}
              </tr>
              {/* Travelers */}
              <tr className="bg-gray-50">
                <td className="pr-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Max Travelers</td>
                {packages.map((p) => (
                  <td key={p._id} className="px-3 py-4">{p.maxTravelers}</td>
                ))}
              </tr>
              {/* Rating */}
              <tr>
                <td className="pr-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Rating</td>
                {packages.map((p) => (
                  <td key={p._id} className="px-3 py-4">
                    {p.averageRating > 0 ? (
                      <div className="flex items-center gap-1">
                        <FaStar size={12} className="text-amber-400" />
                        <span className="font-medium">{p.averageRating.toFixed(1)}</span>
                        <span className="text-gray-400">({p.totalReviews})</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No reviews yet</span>
                    )}
                  </td>
                ))}
              </tr>
              {/* Bookings */}
              <tr className="bg-gray-50">
                <td className="pr-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Bookings</td>
                {packages.map((p) => (
                  <td key={p._id} className="px-3 py-4">{p.totalBookings}</td>
                ))}
              </tr>
              {/* Difficulty */}
              <tr>
                <td className="pr-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Difficulty</td>
                {packages.map((p) => (
                  <td key={p._id} className="px-3 py-4 capitalize">{p.difficultyLevel ?? "â€”"}</td>
                ))}
              </tr>
              {/* Services */}
              {allServices.map((service) => (
                <tr key={service} className="bg-gray-50">
                  <td className="pr-4 py-3 text-xs text-gray-500">{service}</td>
                  {packages.map((p) => (
                    <td key={p._id} className="px-3 py-3">
                      {p.includedServices.includes(service) ? (
                        <CheckmarkCircle01Icon size={18} className="text-green-500" />
                      ) : (
                        <span className="text-gray-300">â€”</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Book buttons */}
              <tr>
                <td />
                {packages.map((p) => (
                  <td key={p._id} className="px-3 py-4">
                    <Link
                      href={`/booking/${p.slug}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                      <Calendar03Icon size={14} /> Book
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="p-10 text-center text-gray-400">Loading comparisonâ€¦</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
