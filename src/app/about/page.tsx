import Link from "next/link";
import {
  FaMapMarkedAlt,
  FaRobot,
  FaUsers,
  FaHeart,
  FaMountain,
  FaGlobeAsia,
} from "react-icons/fa";

const features = [
  {
    icon: FaMapMarkedAlt,
    title: "Explore Nepal",
    description:
      "Discover beautiful destinations, cultural landmarks, mountains, lakes, and hidden gems across Nepal.",
  },
  {
    icon: FaRobot,
    title: "AI-Powered Planning",
    description:
      "Create personalized travel plans based on your destination, interests, travel dates, and preferences.",
  },
  {
    icon: FaUsers,
    title: "Travel Your Way",
    description:
      "Whether you are traveling alone, with friends, or with family, create an itinerary that suits you.",
  },
  {
    icon: FaHeart,
    title: "Memorable Experiences",
    description:
      "We help travelers discover meaningful experiences and make the most of their journey through Nepal.",
  },
];


export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-blue-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80"
            alt="Nepal mountains"
            className="h-full w-full object-cover opacity-40"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">
          <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white">
            About NepalTravels
          </span>

          <h1 className="mt-6 text-5xl font-extrabold text-white md:text-6xl">
            Discover Nepal.
            <br />
            Travel Without Limits.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-200">
            NepalTravels helps travelers discover the beauty of Nepal and
            create personalized journeys with the help of modern technology
            and AI-powered travel planning.
          </p>
        </div>
      </section>

      {/* About Us */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Who We Are
            </span>

            <h2 className="mt-3 text-4xl font-bold text-gray-900">
              Your Travel Companion for Nepal
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              NepalTravels is a travel platform designed to make exploring
              Nepal easier, smarter, and more enjoyable. From discovering
              destinations to planning your itinerary, our platform brings
              important travel information together in one place.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              Our AI-powered travel planner helps travelers create customized
              trips according to their interests, available time, and travel
              preferences.
            </p>

            <Link
              href="/"
              className="mt-8 inline-block rounded-xl bg-blue-700 px-7 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Explore Nepal
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=1000&q=80"
              alt="Nepal landscape"
              className="h-[450px] w-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              What We Offer
            </span>

            <h2 className="mt-3 text-4xl font-bold text-gray-900">
              Everything You Need for Your Journey
            </h2>

            <p className="mt-4 text-gray-600">
              From discovering destinations to creating personalized
              itineraries, NepalTravels is designed to make travel planning
              simple.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl bg-blue-700 px-8 py-16 text-center text-white md:px-16">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <FaMountain size={30} />
          </div>

          <h2 className="mt-6 text-4xl font-bold">
            Our Mission
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-blue-100">
            Our mission is to make Nepal easier to explore by combining
            destination discovery, personalized travel planning, and
            technology into one simple travel experience.
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">

          <FaGlobeAsia className="mx-auto text-5xl text-blue-700" />

          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            Ready to Explore Nepal?
          </h2>

          <p className="mt-4 text-gray-600">
            Start discovering destinations and create your perfect Nepal
            adventure today.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-blue-700 px-8 py-4 font-semibold text-white transition hover:bg-blue-800"
          >
            Start Exploring
          </Link>

        </div>
      </section>

    </main>
  );
}