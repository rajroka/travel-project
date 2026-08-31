"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth/auth-client";
import {
  Calendar03Icon,
  UserGroupIcon,
  MapPinIcon,
  Clock01Icon,
  SquareLockPasswordIcon,
} from "hugeicons-react";
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
  includedServices: string[];
  coverImage?: string;
  destination?: { name: string; location: { city: string; country: string } };
}

interface TravelerForm {
  firstName: string;
  lastName: string;
  nationality: string;
  passportNumber: string;
}

const emptyTraveler = (): TravelerForm => ({
  firstName: "", lastName: "", nationality: "", passportNumber: "",
});

export default function BookingPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loadingPkg, setLoadingPkg] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [travelDate, setTravelDate] = useState("");
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [travelers, setTravelers] = useState<TravelerForm[]>([emptyTraveler()]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace(`/login?redirect=/booking/${packageId}`);
    }
  }, [session, isPending, packageId, router]);

  useEffect(() => {
    fetch(`/api/packages/${packageId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setPkg(j.data.package); })
      .catch(console.error)
      .finally(() => setLoadingPkg(false));
  }, [packageId]);

  useEffect(() => {
    const current = travelers.length;
    if (numberOfTravelers > current) {
      setTravelers(prev => [...prev, ...Array.from({ length: numberOfTravelers - current }, emptyTraveler)]);
    } else {
      setTravelers(prev => prev.slice(0, numberOfTravelers));
    }
  }, [numberOfTravelers]);

  function updateTraveler(i: number, field: keyof TravelerForm, value: string) {
    setTravelers(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      router.replace(`/login?redirect=/booking/${packageId}`);
      return;
    }
    if (!travelDate) { setError("Please select a travel date."); return; }
    if (travelers.some(t => !t.firstName || !t.lastName)) {
      setError("Please fill in first and last name for all travelers.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          packageId: pkg?._id,
          travelDate,
          numberOfTravelers,
          specialRequests: specialRequests || undefined,
          travelers,
          emergencyContact: emergencyName
            ? { name: emergencyName, phone: emergencyPhone, relationship: emergencyRelationship }
            : undefined,
        }),
      });

      const json = await res.json() as { success: boolean; message: string; data?: { booking: { _id: string } } };

      if (!json.success) {
        // If unauthorized, redirect to login
        if (res.status === 401) {
          router.replace(`/login?redirect=/booking/${packageId}`);
          return;
        }
        setError(json.message);
        return;
      }

      router.push(`/booking/confirmation/${json.data!.booking._id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const effectivePrice = pkg?.discountPrice ?? pkg?.price ?? 0;
  const total = effectivePrice * numberOfTravelers;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  const inp = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  // Show loading while checking auth
  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
      </div>
    );
  }

  if (!session?.user) return null; // redirecting

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Complete Your Booking</h1>

        {loadingPkg ? (
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
        ) : !pkg ? (
          <p className="text-red-500">Package not found.</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">

            {/* Left */}
            <div className="space-y-6 lg:col-span-2">

              {/* Package summary */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="relative h-40 bg-gradient-to-br from-green-100 to-teal-200">
                  {pkg.coverImage && (
                    <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" sizes="100vw" />
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-gray-900">{pkg.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                    {pkg.destination && (
                      <span className="flex items-center gap-1"><MapPinIcon size={14} className="text-blue-500" />{pkg.destination.name}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock01Icon size={14} className="text-blue-500" />{pkg.duration.days}D / {pkg.duration.nights}N</span>
                    {pkg.averageRating > 0 && (
                      <span className="flex items-center gap-1"><FaStar size={12} className="text-amber-400" />{pkg.averageRating.toFixed(1)} ({pkg.totalReviews})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip details */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-semibold text-gray-900">Trip Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Travel Date *</label>
                    <div className="relative">
                      <Calendar03Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={travelDate}
                        min={minDate.toISOString().split("T")[0]}
                        onChange={e => setTravelDate(e.target.value)}
                        required
                        className={`${inp} pl-9`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Number of Travelers *</label>
                    <div className="relative">
                      <UserGroupIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={numberOfTravelers}
                        onChange={e => setNumberOfTravelers(Number(e.target.value))}
                        className={`${inp} pl-9`}
                      >
                        {Array.from({ length: pkg.maxTravelers }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? "Traveler" : "Travelers"}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traveler details */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-semibold text-gray-900">Traveler Information</h2>
                <div className="space-y-6">
                  {travelers.map((t, i) => (
                    <div key={i} className="rounded-xl bg-gray-50 p-4">
                      <p className="mb-4 text-sm font-semibold text-gray-700">Traveler {i + 1}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(["firstName", "lastName", "nationality", "passportNumber"] as const).map(field => (
                          <div key={field}>
                            <label className="mb-1 block text-xs font-medium capitalize text-gray-600">
                              {field.replace(/([A-Z])/g, " $1")}
                              {(field === "firstName" || field === "lastName") && <span className="text-red-500"> *</span>}
                            </label>
                            <input
                              value={t[field]}
                              onChange={e => updateTraveler(i, field, e.target.value)}
                              required={field === "firstName" || field === "lastName"}
                              className={inp}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency contact */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-semibold text-gray-900">
                  Emergency Contact <span className="text-sm font-normal text-gray-400">(optional)</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Name", value: emergencyName, set: setEmergencyName },
                    { label: "Phone", value: emergencyPhone, set: setEmergencyPhone },
                    { label: "Relationship", value: emergencyRelationship, set: setEmergencyRelationship },
                  ].map(({ label, value, set }) => (
                    <div key={label}>
                      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
                      <input value={value} onChange={e => set(e.target.value)} className={inp} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Special requests */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-900">
                  Special Requests <span className="text-sm font-normal text-gray-400">(optional)</span>
                </h2>
                <textarea
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Any dietary requirements, accessibility needs, etc."
                  className={`${inp} resize-none`}
                />
              </div>
            </div>

            {/* Right sidebar */}
            <div className="lg:sticky lg:top-24 h-fit space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-semibold text-gray-900">Booking Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per person</span>
                    <span className="font-medium">${effectivePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Travelers</span>
                    <span className="font-medium">× {numberOfTravelers}</span>
                  </div>
                  {travelDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Travel date</span>
                      <span className="font-medium">
                        {new Date(travelDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-blue-700">${total}</span>
                    </div>
                  </div>
                </div>

                {pkg.includedServices.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Included</p>
                    <ul className="space-y-1">
                      {pkg.includedServices.slice(0, 5).map(s => (
                        <li key={s} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className="text-green-500">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
                >
                  <SquareLockPasswordIcon size={16} />
                  {submitting ? "Confirming…" : "Confirm Booking"}
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">
                  You&apos;ll pay with Stripe on the next step.
                </p>
              </div>

              <Link
                href={`/packages/${packageId}`}
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                ← Back to Package
              </Link>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
