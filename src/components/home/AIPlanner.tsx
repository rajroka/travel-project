import Link from "next/link";
import {
  FaRobot,
  FaMapMarkedAlt,
  FaRoute,
  FaMagic,
} from "react-icons/fa";

export default function AIPlanner() {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-20 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">

        {/* Left Side */}
        <div className="flex-1">

          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
            🤖 AI Powered Travel Assistant
          </span>

          <h2 className="mt-6 text-5xl font-bold leading-tight">
            Let AI Plan Your
            <br />
            Perfect Nepal Trip
          </h2>

          <p className="mt-6 max-w-xl text-lg text-blue-100">
            Simply tell us your destination, budget, travel dates, and
            preferences. Our AI creates a personalized itinerary in seconds,
            saving you hours of planning.
          </p>

          <Link
            href="/ai-planner"
            className="mt-10 inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 transition hover:bg-gray-100"
          >
            <FaMagic />
            Generate My Plan
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex-1">

          <div className="rounded-3xl bg-white p-8 text-gray-800 shadow-2xl">

            <h3 className="mb-8 text-2xl font-bold">
              AI Features
            </h3>

            <div className="space-y-6">

              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <FaRobot size={24} />
                </div>

                <div>
                  <h4 className="font-semibold">
                    Smart Recommendations
                  </h4>

                  <p className="text-gray-600">
                    Personalized destinations based on your interests.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <FaRoute size={24} />
                </div>

                <div>
                  <h4 className="font-semibold">
                    Optimized Itinerary
                  </h4>

                  <p className="text-gray-600">
                    Get the best travel route with minimum travel time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <FaMapMarkedAlt size={24} />
                </div>

                <div>
                  <h4 className="font-semibold">
                    Hidden Gems
                  </h4>

                  <p className="text-gray-600">
                    Discover beautiful places that most tourists miss.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}