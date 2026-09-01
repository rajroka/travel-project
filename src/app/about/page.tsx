import Link from "next/link";
import Image from "next/image";
import {
  MapPinIcon,
  UserGroupIcon,
  HeartCheckIcon,
  StarIcon,
  ArrowRight01Icon,
  Calendar03Icon,
} from "hugeicons-react";

const stats = [
  { value: "50+",  label: "Destinations" },
  { value: "200+", label: "Tour Packages" },
  { value: "1K+",  label: "Happy Travelers" },
  { value: "10+",  label: "Years Experience" },
];

const values = [
  {
    icon: MapPinIcon,
    title: "Authentic Experiences",
    desc: "Every package is curated by our local experts who know Nepal inside and out — from the Himalayas to the Terai plains.",
  },
  {
    icon: UserGroupIcon,
    title: "Dedicated Support",
    desc: "Our team is available before, during and after your trip to make sure everything goes smoothly.",
  },
  {
    icon: HeartCheckIcon,
    title: "Traveler First",
    desc: "We listen to what you want and tailor each journey around your interests, budget and travel dates.",
  },
  {
    icon: StarIcon,
    title: "Quality Guaranteed",
    desc: "We partner only with trusted guides, hotels and transport providers who share our commitment to quality.",
  },
];

const team = [
  { name: "Arjun Sharma",   role: "Founder & CEO",         img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { name: "Priya Thapa",    role: "Head of Operations",    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
  { name: "Bikash Gurung",  role: "Lead Tour Guide",       img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80" },
  { name: "Sita Rai",       role: "Customer Experience",   img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative h-80 overflow-hidden bg-blue-900 sm:h-96">
        <Image
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80"
          alt="Nepal mountains"
          fill
          className="object-cover opacity-40"
          sizes="100vw"
          priority
        />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <span className="mb-4 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            About Us
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Your Nepal Travel Experts
          </h1>
          <p className="mt-4 max-w-xl text-base text-gray-200">
            We connect travelers with Nepal&apos;s most breathtaking destinations through
            carefully crafted tour packages and dedicated support.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 sm:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-blue-700">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Our Story</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Born from a love of Nepal
            </h2>
            <p className="mt-5 leading-7 text-gray-600">
              Founded in Kathmandu, we started as a small team of passionate trekkers
              and travel guides who wanted to share the magic of Nepal with the world.
              Over the years we have grown into a full-service tour operator trusted
              by thousands of international and domestic travelers.
            </p>
            <p className="mt-4 leading-7 text-gray-600">
              From the snow-capped peaks of the Annapurna circuit to the lush jungles
              of Chitwan, we design journeys that connect you with Nepal&apos;s landscapes,
              culture and people in a meaningful way.
            </p>
            <Link
              href="/packages"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              View Our Packages <ArrowRight01Icon size={16} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=900&q=80"
              alt="Nepal landscape"
              width={900}
              height={600}
              className="h-80 w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">What We Stand For</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Our Values</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(v => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <Icon size={22} className="text-blue-700" />
                  </div>
                  <h3 className="mt-4 font-bold text-gray-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">The People Behind It</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Meet Our Team</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map(m => (
              <div key={m.name} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={m.img}
                    alt={m.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900">{m.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission banner ───────────────────────────────────────────── */}
      <section className="bg-blue-700 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Calendar03Icon size={40} className="mx-auto mb-5 text-white/70" />
          <h2 className="text-3xl font-bold text-white">Our Mission</h2>
          <p className="mt-4 text-lg leading-7 text-blue-100">
            To make Nepal accessible to every traveler by offering safe,
            sustainable and unforgettable journeys that benefit local
            communities and preserve the natural environment.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to explore Nepal?</h2>
          <p className="mt-4 text-gray-500">
            Browse our tour packages or get in touch — we&apos;d love to help plan your trip.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Browse Packages <ArrowRight01Icon size={16} />
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-700 px-7 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-700 hover:text-white"
            >
              View Destinations
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
