"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPinIcon, Calendar03Icon, UserGroupIcon } from "hugeicons-react";

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
      {/* Background Images Grid */}
      <div className="grid h-[650px] grid-cols-3 grid-rows-2">
        {images.map((image, index) => (
          <div key={index} className="relative h-full w-full">
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="33vw"
              priority={index < 3}
            />
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-6xl px-6 text-center">
          <span className="rounded-full bg-blue-600/80 px-5 py-2 text-sm font-semibold text-white">
            🇳🇵 Explore Nepal Like Never Before
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Discover Nepal&apos;s
            <br />
            Hidden Wonders
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-200">
            Explore breathtaking mountains, serene lakes, rich culture,
            and unforgettable adventures with our AI-powered travel planner.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-3 rounded-2xl bg-white p-4 shadow-2xl md:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
              <MapPinIcon size={20} className="text-blue-600 flex-shrink-0" />
              <input
                type="text"
                placeholder="Destination"
                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
              <Calendar03Icon size={20} className="text-blue-600 flex-shrink-0" />
              <input
                type="date"
                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
              <UserGroupIcon size={20} className="text-blue-600 flex-shrink-0" />
              <input
                type="number"
                min={1}
                placeholder="Travelers"
                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
