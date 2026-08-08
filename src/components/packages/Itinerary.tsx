"use client";

import { useState } from "react";

const days = [
  {
    number: 1,
    title: "Arrival & Phewa Sunset",
    description:
      "Welcome to Pokhara! Upon arrival, our representative will transfer you to your hotel. After a short rest, enjoy a traditional boat ride on Phewa Lake.",
    tags: ["Airport Pickup", "Boating", "Welcome Dinner"],
  },
  {
    number: 2,
    title: "Sunrise & Adventure",
    description:
      "Start your morning with a spectacular sunrise from Sarangkot followed by a day of adventure activities around Pokhara.",
    tags: ["Sunrise", "Adventure", "Breakfast"],
  },
  {
    number: 3,
    title: "Spiritual Peace & Hiking",
    description:
      "Explore the World Peace Pagoda and enjoy a peaceful hike through the surrounding hills.",
    tags: ["Hiking", "Temple Visit", "Local Guide"],
  },
  {
    number: 4,
    title: "Farewell Pokhara",
    description:
      "Enjoy your final breakfast before departing Pokhara with unforgettable memories.",
    tags: ["Breakfast", "Hotel Checkout", "Departure"],
  },
];

export default function Itinerary() {
  const [openDay, setOpenDay] = useState(1);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">
        Your 4-Day Journey
      </h2>

      <div className="mt-5 space-y-3">
        {days.map((day) => {
          const isOpen = openDay === day.number;

          return (
            <div
              key={day.number}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <button
                onClick={() =>
                  setOpenDay(isOpen ? 0 : day.number)
                }
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      isOpen
                        ? "bg-blue-800 text-white"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {day.number}
                  </span>

                  <span className="text-sm font-medium text-gray-900">
                    {day.title}
                  </span>
                </div>

                <span className="text-gray-500">
                  {isOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-14 pb-5 pt-4">
                  <p className="text-sm leading-6 text-gray-600">
                    {day.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {day.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-blue-50 px-3 py-1 text-xs text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}