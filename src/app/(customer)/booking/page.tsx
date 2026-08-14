import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const upcomingTrips = [
  {
    title: "Amalfi Coast Getaway",
    date: "Oct 12 - Oct 18, 2024",
    travelers: "2 Travelers",
    image: "/images/restaurant1.jpg",
    status: "Confirmed",
    action: "Details",
  },
  {
    title: "Tokyo Tech & Tradition",
    date: "Nov 04 - Nov 12, 2024",
    travelers: "1 Traveler",
    image: "/images/premium_photo-1661953124283-76d0a8436b87.avif",
    status: "Pending",
    action: "Complete Payment",
  },
];

const recentHistory = [
  {
    title: "Paris Weekend Trip",
    date: "Completed Sep 2024",
    icon: "✈",
  },
  {
    title: "NY Plaza Hotel Stay",
    date: "Completed Aug 2024",
    icon: "▣",
  },
  {
    title: "Swiss Rail Pass",
    date: "Completed Jul 2024",
    icon: "▣",
  },
];

const favoriteDestinations = [
  {
    name: "Bali, Indonesia",
    type: "TROPICAL",
    image: "/images/restaurant1.jpg",
  },
  {
    name: "Santorini, Greece",
    type: "ISLAND",
    image: "/images/Restaurant2.jpg",
  },
  {
    name: "Zermatt, Switzerland",
    type: "MOUNTAIN",
    image: "/images/map.jpg",
  },
  {
    name: "Petra, Jordan",
    type: "HISTORICAL",
    image: "/images/premium_photo-1661953124283-76d0a8436b87.avif",
  },
];

const savedPlans = [
  {
    title: "Moroccan Desert Safari",
    description:
      "A curated 10-day journey through Marrakech, Sahara dunes, and Atlas mountains with private experiences.",
    date: "Generated 2 days ago",
  },
  {
    title: "Scandinavian Northern Lights",
    description:
      "A cozy winter expedition through Norway and Finland focusing on aurora spotting and local experiences.",
    date: "Generated 1 week ago",
  },
];

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#f8f9ff] text-[#172033]">
      <Navbar />

      <div className="mx-auto max-w-[1280px] px-6 py-8">
        {/* PAGE HEADER */}
        <section className="mb-7">
          <h1 className="text-3xl font-bold leading-tight text-[#172033]">
            Welcome back, Alex.
          </h1>

          <p className="mt-1 text-sm text-[#727d8e]">
            You have 2 upcoming adventures waiting for you.
          </p>
        </section>

        {/* UPCOMING TRIPS + RECENT HISTORY */}
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* UPCOMING TRIPS */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#172033]">
                Upcoming Trips
              </h2>

              <button className="text-xs font-medium text-[#1746c7] hover:underline">
                View All
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.title}
                  className="overflow-hidden rounded-xl border border-[#dfe5ec] bg-white"
                >
                  {/* IMAGE */}
                  <div className="relative h-[125px] overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute right-2 top-2 rounded-md bg-white px-2 py-1 text-[9px] font-medium text-[#1746c7] shadow-sm">
                      {trip.status}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-[#172033]">
                      {trip.title}
                    </h3>

                    <p className="mt-1 text-[10px] text-[#7b8797]">
                      {trip.date}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-[#687487]">
                        {trip.travelers}
                      </span>

                      <button
                        className={`rounded-md px-3 py-1.5 text-[9px] font-semibold ${
                          trip.action === "Details"
                            ? "bg-[#1746c7] text-white"
                            : "border border-[#1746c7] text-[#1746c7]"
                        }`}
                      >
                        {trip.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT HISTORY */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#172033]">
                Recent History
              </h2>
            </div>

            <div className="rounded-xl border border-[#dfe5ec] bg-white p-3">
              <div className="space-y-1">
                {recentHistory.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-[#f7f9fc]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef3ff] text-xs text-[#1746c7]">
                      {item.icon}
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-[#263246]">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-[9px] text-[#8993a3]">
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-3 w-full rounded-md border border-[#dfe5ec] py-2 text-[9px] font-medium text-[#1746c7] hover:bg-[#f7f9fc]">
                Download All Invoices
              </button>
            </div>
          </div>
        </section>

        {/* FAVORITE DESTINATIONS */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172033]">
              My Favorite Destinations
            </h2>

            <button className="text-xs font-medium text-[#1746c7] hover:underline">
              Explore More →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {favoriteDestinations.map((destination) => (
              <div
                key={destination.name}
                className="group relative h-[155px] overflow-hidden rounded-lg"
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8">
                  <p className="text-xs font-bold text-white">
                    {destination.name}
                  </p>

                  <p className="mt-0.5 text-[8px] font-medium tracking-wide text-white/80">
                    {destination.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SAVED AI TRIP PLANS */}
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-1">
            <h2 className="text-base font-bold text-[#172033]">
              Saved AI Trip Plans
            </h2>

            <span className="text-sm text-[#f28a19]">✣</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {savedPlans.map((plan) => (
              <div
                key={plan.title}
                className="rounded-xl border border-[#dfe5ec] bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1746c7] text-xs text-white">
                    ✦
                  </div>

                  <span className="rounded-sm bg-[#eef3ff] px-1.5 py-0.5 text-[7px] font-medium text-[#1746c7]">
                    SAVED
                  </span>
                </div>

                <h3 className="mt-3 text-xs font-bold text-[#263246]">
                  {plan.title}
                </h3>

                <p className="mt-1.5 text-[9px] leading-4 text-[#7b8797]">
                  {plan.description}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[8px] text-[#9aa3b1]">
                    {plan.date}
                  </span>

                  <button className="text-[9px] font-semibold text-[#f28a19] hover:underline">
                    Review →
                  </button>
                </div>
              </div>
            ))}

            {/* CREATE NEW PLAN */}
            <Link
              href="/ai-planner"
              className="flex min-h-[170px] flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd4e1] bg-white text-center transition hover:border-[#1746c7] hover:bg-[#f8faff]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7deea] text-sm text-[#657083]">
                +
              </div>

              <h3 className="mt-2 text-[10px] font-semibold text-[#263246]">
                Plan New Trip
              </h3>

              <p className="mt-1 text-[8px] text-[#9aa3b1]">
                Let AI build your next dream escape
              </p>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}