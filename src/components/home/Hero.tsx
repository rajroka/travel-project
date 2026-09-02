"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search01Icon,
  CheckmarkCircle01Icon,
  Tag01Icon,
} from "hugeicons-react";

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/packages");
    }
  }

  return (
    <section className="relative h-[580px] overflow-hidden sm:h-[620px]">

      {/* ── Background image ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-image.jpg)' }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">

        {/* Heading */}
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          Discover Nepal, Your Way
        </h1>

        {/* Sub */}
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-gray-200 sm:text-lg">
          For over two generations, we&apos;ve been creating unforgettable trekking
          and tour experiences across Nepal. From the Himalayas to hidden trails,
          let us take you on your next adventure.
        </p>

        {/* ── Search bar ───────────────────────────────────────── */}
        <form
          onSubmit={handleSearch}
          className="mt-8 flex w-full max-w-xl items-center gap-0 overflow-hidden rounded-full bg-white shadow-2xl"
        >
          <div className="flex flex-1 items-center gap-3 px-5">
            <Search01Icon size={18} className="flex-shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search treks and tour packages…"
              className="w-full bg-transparent py-4 text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            className="m-1.5 rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {/* ── Feature pills ────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Pill
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20l5-10 4 6 3-4 6 8H3z"/>
              </svg>
            }
            label="Himalayan Experts"
          />
          <Pill icon={<CheckmarkCircle01Icon size={16} />} label="Hassle-Free Travel" />
          <Pill icon={<Tag01Icon size={16} />} label="Best Price" />
        </div>
      </div>
    </section>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm">
      {icon}
      {label}
    </div>
  );
}
