"use client";

import { useEffect, useState } from "react";
import { CalendarCheckIn01Icon } from "hugeicons-react";

interface Trip {
  _id: string;
  bookingNumber: string;
  travelDate: string;
  numberOfTravelers: number;
  status: string;
  user: { name?: string; email: string; phone?: string };
  package: { title: string; duration: { days: number; nights: number } };
}

export default function StaffSchedulePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings?status=confirmed&sort=travel_date&limit=50", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          const upcoming = j.data.bookings.filter(
            (b: Trip) => new Date(b.travelDate) >= new Date()
          );
          setTrips(upcoming);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group by date
  const grouped = trips.reduce((acc: Record<string, Trip[]>, t) => {
    const date = new Date(t.travelDate).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    acc[date] = [...(acc[date] ?? []), t];
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">Upcoming confirmed trips</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-16 text-center shadow-sm">
          <CalendarCheckIn01Icon size={48} className="mb-3 text-gray-300" />
          <p className="text-gray-400">No upcoming trips scheduled.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayTrips]) => (
            <div key={date}>
              <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">{date}</h2>
              <div className="space-y-3">
                {dayTrips.map((t) => (
                  <div key={t._id} className="flex items-start justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.package.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        #{t.bookingNumber} · {t.user.name ?? t.user.email}
                        {t.user.phone && ` · ${t.user.phone}`}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {t.numberOfTravelers} traveler{t.numberOfTravelers > 1 ? "s" : ""} ·{" "}
                        {t.package.duration.days}D / {t.package.duration.nights}N
                      </p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 flex-shrink-0">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
