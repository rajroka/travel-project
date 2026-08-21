import Link from "next/link";
import { AiBeautifyIcon, Route01Icon, MapsIcon, StarIcon } from "hugeicons-react";

const features = [
  {
    icon: <StarIcon size={24} className="text-blue-700" />,
    title: "Smart Recommendations",
    description: "Personalized destinations based on your interests.",
  },
  {
    icon: <Route01Icon size={24} className="text-blue-700" />,
    title: "Optimized Itinerary",
    description: "Get the best travel route with minimum travel time.",
  },
  {
    icon: <MapsIcon size={24} className="text-blue-700" />,
    title: "Hidden Gems",
    description: "Discover beautiful places that most tourists miss.",
  },
];

export default function AIPlanner() {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-20 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 lg:flex-row">

        {/* Left */}
        <div className="flex-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
            <AiBeautifyIcon size={16} /> AI Powered Travel Assistant
          </span>

          <h2 className="mt-6 text-5xl font-bold leading-tight">
            Let AI Plan Your
            <br />
            Perfect Nepal Trip
          </h2>

          <p className="mt-6 max-w-xl text-lg text-blue-100">
            Simply tell us your destination, budget, travel dates, and preferences.
            Our AI creates a personalized itinerary in seconds.
          </p>

          <Link
            href="/ai-planner"
            className="mt-10 inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 transition hover:bg-gray-100"
          >
            <AiBeautifyIcon size={20} />
            Generate My Plan
          </Link>
        </div>

        {/* Right */}
        <div className="flex-1">
          <div className="rounded-3xl bg-white p-8 text-gray-800 shadow-2xl">
            <h3 className="mb-8 text-2xl font-bold">AI Features</h3>
            <div className="space-y-6">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-xl bg-blue-50 p-3">{f.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{f.title}</h4>
                    <p className="mt-0.5 text-sm text-gray-500">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
