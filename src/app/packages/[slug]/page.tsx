"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import {
  MapPinIcon,
  Clock01Icon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  ArrowLeft01Icon,
  Calendar03Icon,
} from "hugeicons-react";

interface Package {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  coverImage?: string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
  maxTravelers: number;
  minTravelers?: number;
  includedServices: string[];
  excludedServices?: string[];
  highlights?: string[];
  requirements?: string[];
  difficultyLevel?: string;
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities?: string[];
    accommodation?: string;
    meals?: string[];
  }>;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  isPromotional: boolean;
  destination?: { name: string; slug: string; location: { city: string; country: string } };
}

export default function PackageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "inclusions">("overview");
  const [openDay, setOpenDay] = useState<number | null>(1);

  useEffect(() => {
    fetch(`/api/packages/${slug}`)
      .then(r => r.json())
      .then(j => { if (j.success) setPkg(j.data.package); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-4">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
          <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-500">Package not found.</p>
        <Link href="/packages" className="text-sm text-blue-600 hover:underline">Browse all</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft01Icon size={16} /> All Packages
        </button>

        {/* Hero */}
        <div className="relative mb-8 h-72 overflow-hidden rounded-3xl bg-gradient-to-br from-green-100 to-teal-200 sm:h-96">
          {pkg.coverImage && (
            <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" sizes="100vw" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            {pkg.isPromotional && (
              <span className="mb-2 inline-block rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">SALE</span>
            )}
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{pkg.title}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/80">
              {pkg.destination && <span className="flex items-center gap-1"><MapPinIcon size={13} />{pkg.destination.name}</span>}
              <span className="flex items-center gap-1"><Clock01Icon size={13} />{pkg.duration.days}D / {pkg.duration.nights}N</span>
              <span className="flex items-center gap-1"><UserGroupIcon size={13} />Max {pkg.maxTravelers}</span>
              {pkg.averageRating > 0 && (
                <span className="flex items-center gap-1">
                  <FaStar size={11} className="text-amber-400" />{pkg.averageRating.toFixed(1)} ({pkg.totalReviews})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-gray-100">
              {(["overview", "itinerary", "inclusions"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium capitalize transition ${activeTab === tab ? "bg-blue-700 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 font-semibold text-gray-900">About This Package</h2>
                  <p className="leading-7 text-gray-600">{pkg.description}</p>
                </div>
                {(pkg.highlights ?? []).length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 font-semibold text-gray-900">Highlights</h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {pkg.highlights!.map(h => (
                        <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-blue-500">★</span> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "itinerary" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-semibold text-gray-900">{pkg.duration.days}-Day Itinerary</h2>
                {pkg.itinerary.length === 0 ? (
                  <p className="text-sm text-gray-400">Itinerary details coming soon.</p>
                ) : (
                  <div className="space-y-3">
                    {pkg.itinerary.map(day => (
                      <div key={day.day} className="overflow-hidden rounded-xl border border-gray-200">
                        <button onClick={() => setOpenDay(openDay === day.day ? null : day.day)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                          <div className="flex items-center gap-4">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${openDay === day.day ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-700"}`}>
                              {day.day}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{day.title}</span>
                          </div>
                          <span className="text-gray-400 text-sm">{openDay === day.day ? "▲" : "▼"}</span>
                        </button>
                        {openDay === day.day && (
                          <div className="border-t border-gray-100 px-5 py-4">
                            <p className="text-sm text-gray-600 leading-6">{day.description}</p>
                            {(day.activities ?? []).length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {day.activities!.map(a => (
                                  <span key={a} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">{a}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "inclusions" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 font-semibold text-gray-900">Included</h2>
                  <ul className="space-y-2">
                    {pkg.includedServices.map(s => (
                      <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckmarkCircle01Icon size={16} className="flex-shrink-0 text-green-500" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                {(pkg.excludedServices ?? []).length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 font-semibold text-gray-900">Not Included</h2>
                    <ul className="space-y-2">
                      {pkg.excludedServices!.map(s => (
                        <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-red-400">✕</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-1 text-xs text-gray-400">Starting from</div>
              {pkg.discountPrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-700">${pkg.discountPrice}</span>
                  <span className="text-sm text-gray-400 line-through">${pkg.price}</span>
                </div>
              ) : (
                <div className="text-2xl font-bold text-blue-700">${pkg.price}</div>
              )}
              <div className="text-xs text-gray-400 mb-5">per person</div>

              <div className="space-y-3 text-sm text-gray-600 mb-5">
                <div className="flex items-center gap-2"><Clock01Icon size={15} className="text-blue-500" />{pkg.duration.days} Days, {pkg.duration.nights} Nights</div>
                <div className="flex items-center gap-2"><UserGroupIcon size={15} className="text-blue-500" />Max {pkg.maxTravelers} travelers</div>
                {pkg.difficultyLevel && (
                  <div className="flex items-center gap-2"><span className="text-blue-500">⚡</span><span className="capitalize">{pkg.difficultyLevel} difficulty</span></div>
                )}
              </div>

              <button onClick={() => router.push(`/booking/${pkg.slug}`)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">
                <Calendar03Icon size={16} /> Book This Package
              </button>
            </div>

            {pkg.totalBookings > 0 && (
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                🔥 {pkg.totalBookings} people have booked this tour
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
