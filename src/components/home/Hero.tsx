"use client";

import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaMagic,
} from "react-icons/fa";

const images = [
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
  "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Images */}
      <div className="grid h-[650px] grid-cols-3 grid-rows-2">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt=""
            className="h-full w-full object-cover"
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-6xl px-6 text-center">

          <span className="rounded-full bg-blue-600/80 px-5 py-2 text-sm font-semibold text-white">
            🇳🇵 Explore Nepal Like Never Before
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Discover Nepal's
            <br />
            Hidden Wonders
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-200">
            Explore breathtaking mountains, serene lakes, rich culture,
            and unforgettable adventures with our AI-powered travel planner.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-3 rounded-2xl bg-white p-4 shadow-2xl md:grid-cols-4">

            {/* Destination */}
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <FaMapMarkerAlt className="text-blue-600 text-xl" />
              <input
                type="text"
                placeholder="Destination"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Date */}
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <FaCalendarAlt className="text-blue-600 text-xl" />
              <input
                type="text"
                placeholder="Travel Date"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Travelers */}
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <FaUsers className="text-blue-600 text-xl" />
              <input
                type="text"
                placeholder="Travelers"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Button */}
            <Link
              href="/ai-planner"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-800"
            >
              <FaMagic />
              Generate My Plan
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}