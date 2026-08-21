"use client";

import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    title: "Kathmandu",
    slug: "kathmandu",
    description: "Culture & Heritage",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Pokhara",
    slug: "pokhara",
    description: "Lakes & Mountains",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Chitwan",
    slug: "chitwan",
    description: "Wildlife & Nature",
    image: "https://images.unsplash.com/photo-1549366021-9daf32a5eb16?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Everest",
    slug: "everest",
    description: "Adventure & Trekking",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop",
  },
];

export default function Categories() {
  return (
    <section className="bg-gray-50 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Popular destinations</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Where will you go?</h2>
          <p className="mt-2 text-gray-500">Explore some of Nepal&apos;s most amazing destinations.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={`/search?q=${category.title}&type=destination`}
              className="group relative h-72 overflow-hidden rounded-2xl"
            >
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                <p className="mt-1 text-sm text-white/80">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
