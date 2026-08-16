"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Destination = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  description: string;
  image?: string;
};

const destinations: Destination[] = [
  {
    id: "pokhara",
    name: "Pokhara",
    category: "Lakes",
    location: "Gandaki, Nepal",
    rating: 4.9,
    description:
      "A peaceful lakeside city surrounded by spectacular Himalayan scenery.",
    image: "/images/pokhara.jpg",
  },
  {
    id: "everest-base-camp",
    name: "Everest Base Camp",
    category: "Mountains",
    location: "Solukhumbu, Nepal",
    rating: 5.0,
    description:
      "Experience one of the world's most famous Himalayan trekking routes.",
          image: "/images/everest.jpg",


  },
  {
    id: "chitwan",
    name: "Chitwan National Park",
    category: "Wildlife",
    location: "Chitwan, Nepal",
    rating: 4.8,
    description:
      "Explore Nepal's jungle wilderness and discover its incredible wildlife.",
      image: "/images/chitwan.jpg",
  },
  {
    id: "lumbini",
    name: "Lumbini",
    category: "Heritage",
    location: "Rupandehi, Nepal",
    rating: 4.7,
    description:
      "Visit the birthplace of Buddha and explore its peaceful heritage sites.",
      image: "/images/lumbini.jpg",
  },
  {
    id: "kathmandu",
    name: "Kathmandu",
    category: "Heritage",
    location: "Bagmati, Nepal",
    rating: 4.8,
    description:
      "Discover ancient temples, historic squares and the cultural heart of Nepal.",
      image: "/images/kathma.jpg",
  },
  {
    id: "mustang",
    name: "Mustang",
    category: "Mountains",
    location: "Gandaki, Nepal",
    rating: 4.9,
    description:
      "Explore dramatic Himalayan landscapes and the unique culture of Mustang.",
      image: "/images/mustang.jpg",
  },
  {
    id: "annapurna",
    name: "Annapurna",
    category: "Mountains",
    location: "Gandaki, Nepal",
    rating: 4.9,
    description:
      "Trek through spectacular mountain scenery and traditional Himalayan villages.",
      image: "/images/annapurna.jpg",
  },
  {
    id: "rara",
    name: "Rara Lake",
    category: "Lakes",
    location: "Mugu, Nepal",
    rating: 4.8,
    description:
      "Escape to the peaceful surroundings of Nepal's largest lake.",
      image: "/images/rara.jpg",
  },
  {
    id: "bandipur",
    name: "Bandipur",
    category: "Heritage",
    location: "Tanahun, Nepal",
    rating: 4.7,
    description:
      "Experience a beautiful hilltop town filled with traditional architecture.",
      image: "/images/bandipur.jpg",
  },
];

const categories = [
  "All",
  "Mountains",
  "Lakes",
  "Heritage",
  "Wildlife",
];

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      const matchesSearch =
        destination.name.toLowerCase().includes(search.toLowerCase()) ||
        destination.location.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || destination.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-[#181a1b] text-white">
      <Navbar />

      {/* HERO */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#3d8bfd]">
            Explore Nepal
          </p>

          <h1 className="text-4xl font-bold md:text-6xl">
            Discover Nepal's
            <span className="block text-[#3d8bfd]">
              Most Amazing Destinations
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#a7adb5]">
            From majestic mountains and peaceful lakes to ancient heritage
            sites and wild jungles, discover your next adventure in Nepal.
          </p>
        </div>
      </section>

      {/* SEARCH + FILTER */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="rounded-2xl border border-white/10 bg-[#1d2021] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* SEARCH */}
            <div className="relative w-full lg:max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations..."
                className="h-12 w-full rounded-xl border border-white/10 bg-[#151718] pl-12 pr-4 text-sm outline-none placeholder:text-[#697078] focus:border-[#2463eb]"
              />
            </div>

            {/* CATEGORIES */}
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                    category === item
                      ? "bg-[#1746c7] text-white"
                      : "bg-[#25292a] text-[#aeb4bb] hover:bg-[#303536] hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">
            Explore Destinations
          </h2>

          <p className="mt-2 text-sm text-[#858c94]">
            {filteredDestinations.length} destinations found
          </p>
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#1d2021] py-20 text-center">
            <div className="text-4xl">🔍</div>

            <h3 className="mt-4 text-xl font-semibold">
              No destinations found
            </h3>

            <p className="mt-2 text-sm text-[#858c94]">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI PLANNER CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl border border-[#1746c7]/30 bg-[#172033] px-8 py-12 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Not sure where to go?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#aeb7c5]">
            Let our AI-powered travel planner create a personalized itinerary
            based on your interests, budget and travel dates.
          </p>

          <a
            href="/ai-planner"
            className="mt-7 inline-flex rounded-xl bg-[#1746c7] px-7 py-3.5 text-sm font-semibold transition hover:bg-[#2057e0]"
          >
            ✨ Plan My Trip
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function DestinationCard({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/5 bg-[#1d2021] transition duration-300 hover:-translate-y-1 hover:border-[#2463eb]/40">
      {/* IMAGE */}
      <div className="relative h-[230px] overflow-hidden bg-gradient-to-br from-[#172033] to-[#25292a]">
        {destination.image ? (
          <img
            src={destination.image}
            alt={destination.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-5xl">🏔️</div>
              <p className="mt-3 text-sm text-[#8e969f]">
                {destination.name}
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute right-4 top-4 rounded-lg bg-black/65 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
          ⭐ {destination.rating}
        </div>

        <div className="absolute bottom-4 left-4 rounded-lg bg-[#1746c7] px-3 py-1 text-xs font-semibold">
          {destination.category}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="text-xl font-bold">
          {destination.name}
        </h3>

        <p className="mt-2 text-sm text-[#8e969f]">
          📍 {destination.location}
        </p>

        <p className="mt-4 min-h-[68px] text-sm leading-6 text-[#a8afb6]">
          {destination.description}
        </p>

        <a
          href={`/destinations/${destination.id}`}
          className="mt-5 flex h-11 items-center justify-center rounded-xl bg-[#1746c7] text-sm font-semibold transition hover:bg-[#2057e0]"
        >
          Explore
        </a>
      </div>
    </article>
  );
}