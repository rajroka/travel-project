"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Destination = {
  name: string;
  slug: string;
  category: string;
  location: string;
  rating: number;
  description: string;
  image: string;
};

const destinations: Destination[] = [
  {
    name: "Pokhara",
    slug: "pokhara",
    category: "Lakes",
    location: "Gandaki, Nepal",
    rating: 4.9,
    description:
      "The city of lakes with breathtaking mountain views, peaceful surroundings and unforgettable adventures.",
    image:
      "/images/pokhara.jpg",
  },
  {
    name: "Everest Base Camp",
    slug: "everest-base-camp",
    category: "Mountains",
    location: "Solukhumbu, Nepal",
    rating: 5.0,
    description:
      "Experience the legendary Himalayan trail leading to the base of the world's highest mountain.",
    image:
      "/images/everest.jpg",
  },
  {
    name: "Chitwan National Park",
    slug: "chitwan",
    category: "Wildlife",
    location: "Chitwan, Nepal",
    rating: 4.8,
    description:
      "Explore Nepal's famous jungle wilderness with safaris, wildlife and the iconic one-horned rhinoceros.",
    image:
      "/images/chitwan.jpg",
  },
  {
    name: "Lumbini",
    slug: "lumbini",
    category: "Heritage",
    location: "Rupandehi, Nepal",
    rating: 4.7,
    description:
      "Visit the birthplace of Lord Buddha and discover one of Nepal's most important spiritual destinations.",
    image:
      "/images/lumbini.jpg",
  },
  {
    name: "Kathmandu",
    slug: "kathmandu",
    category: "Heritage",
    location: "Bagmati, Nepal",
    rating: 4.8,
    description:
      "Discover ancient temples, vibrant streets, historic squares and the cultural heart of Nepal.",
    image:
      "/images/kathmandu.jpg",
  },
  {
    name: "Mustang",
    slug: "mustang",
    category: "Mountains",
    location: "Gandaki, Nepal",
    rating: 4.9,
    description:
      "Journey through dramatic landscapes, ancient villages and the unique Himalayan culture of Mustang.",
    image:
      "/images/mustang.jpg",
  },
  {
    name: "Annapurna",
    slug: "annapurna",
    category: "Mountains",
    location: "Gandaki, Nepal",
    rating: 4.9,
    description:
      "Trek through spectacular mountain scenery, traditional villages and some of Nepal's best trails.",
    image:
      "/images/annapurna.jpg",
  },
  {
    name: "Rara Lake",
    slug: "rara-lake",
    category: "Lakes",
    location: "Mugu, Nepal",
    rating: 4.8,
    description:
      "Escape into the peaceful beauty of Nepal's largest lake surrounded by pristine forests and mountains.",
    image:
      "/images/rara.jpg",
  },
  {
    name: "Bandipur",
    slug: "bandipur",
    category: "Heritage",
    location: "Tanahun, Nepal",
    rating: 4.7,
    description:
      "Experience a beautifully preserved hilltop town filled with traditional architecture and mountain views.",
    image:
      "/images/bandipur.jpg",
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
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      const matchesSearch =
        destination.name.toLowerCase().includes(search.toLowerCase()) ||
        destination.location.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" ||
        destination.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <main className="min-h-screen bg-[#181a1b] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1746c733,transparent_55%)]" />

        <div className="relative mx-auto max-w-[1280px] px-6 py-20 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#3d8bfd]">
            Explore Nepal
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Discover Nepal's
            <span className="block text-[#3d8bfd]">
              Most Amazing Destinations
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#a7adb5] md:text-lg">
            From the highest mountains to peaceful lakes, ancient heritage
            sites and wild jungles, discover places that make Nepal
            unforgettable.
          </p>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="mx-auto max-w-[1280px] px-6 pt-10">
        <div className="rounded-2xl border border-white/10 bg-[#1d2021] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* SEARCH */}
            <div className="relative w-full lg:max-w-[480px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#727982]">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations..."
                className="h-12 w-full rounded-xl border border-white/10 bg-[#151718] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-[#697078] focus:border-[#2463eb]"
              />
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                    activeCategory === category
                      ? "bg-[#1746c7] text-white"
                      : "bg-[#25292a] text-[#aeb4bb] hover:bg-[#303536] hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">
              Explore Destinations
            </h2>

            <p className="mt-2 text-sm text-[#858c94]">
              {filteredDestinations.length} destinations found
            </p>
          </div>
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
                key={destination.slug}
                destination={destination}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1280px] px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-[#1746c7]/30 bg-gradient-to-r from-[#10275e] to-[#172033] px-8 py-12 text-center md:px-16">
          <h2 className="text-2xl font-bold md:text-3xl">
            Not sure where to go?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#aeb7c5]">
            Let our AI-powered travel planner create a personalized Nepal
            itinerary based on your interests, budget and travel dates.
          </p>

          <a
            href="/ai-planner"
            className="mt-7 inline-flex rounded-xl bg-[#1746c7] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2057e0]"
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
    <article className="group overflow-hidden rounded-2xl border border-white/5 bg-[#1d2021] transition duration-300 hover:-translate-y-1 hover:border-[#2463eb]/40 hover:shadow-2xl">
      {/* IMAGE */}
      <div className="relative h-[230px] overflow-hidden bg-[#252829]">
        <img
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute right-4 top-4 rounded-lg bg-black/65 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
          ⭐ {destination.rating}
        </div>

        <div className="absolute bottom-4 left-4 rounded-lg bg-[#1746c7] px-3 py-1 text-xs font-semibold">
          {destination.category}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-white">
            {destination.name}
          </h3>
        </div>

        <p className="mt-2 text-sm text-[#8e969f]">
          📍 {destination.location}
        </p>

        <p className="mt-4 min-h-[68px] text-sm leading-6 text-[#a8afb6]">
          {destination.description}
        </p>

        <a
          href={`/destinations/${destination.slug}`}
          className="mt-5 flex h-11 items-center justify-center rounded-xl bg-[#1746c7] text-sm font-semibold text-white transition hover:bg-[#2057e0]"
        >
          Explore
        </a>
      </div>
    </article>
  );
}