"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar03Icon, MapPinIcon, Clock01Icon } from "hugeicons-react";

interface Booking {
  _id: string;
  bookingNumber: string;
  travelDate: string;
  status: string;
  numberOfTravelers: number;
  totalAmount: number;
  package: { title: string; coverImage?: string; duration: { days: number; nights: number } };
}

export default function UpcomingTripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings?status=confirmed&sort=travel_date", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const upcoming = json.data.bookings.filter(
            (b: Booking) => new Date(b.travelDate) >= new Date()
          );
          setBookings(upcoming);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Trips</h1>
        <p className="mt-1 text-gray-500">Your confirmed trips coming up</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <Calendar03Icon size={56} className="mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700">No upcoming trips</h3>
          <p className="mt-1 text-sm text-gray-400">Book a tour to see your trips here.</p>
          <Link href="/packages" className="mt-4 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition">
            Browse packages
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{b.package.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">#{b.bookingNumber}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Confirmed
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar03Icon size={16} className="text-blue-500" />
                    {new Date(b.travelDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock01Icon size={16} className="text-blue-500" />
                    {b.package.duration.days}D / {b.package.duration.nights}N
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon size={16} className="text-blue-500" />
                    {b.numberOfTravelers} traveller{b.numberOfTravelers > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${b.totalAmount}</span>
                  <Link href={`/bookings/${b._id}`} className="text-sm text-blue-600 hover:underline">
                    View details â†’
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
