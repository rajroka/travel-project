import { FaShareAlt, FaBookmark } from "react-icons/fa";

export default function Hero() {
  return (
<section className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm hover:shadow-2xl transition-all duration-300">
      {/* Top */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
            AI-OPTIMIZED
          </span>

          <span className="text-gray-500 text-sm">
            Created: Just now
          </span>
        </div>

        <div className="flex gap-3">
          <button className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-50">
            <FaShareAlt />
            Share
          </button>

          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <FaBookmark />
            Save Plan
          </button>
        </div>

      </div>

      {/* Heading */}

<h1 className="text-6xl font-extrabold text-slate-900 mt-8 leading-tight">        Imperial Heritage:
        <br />
        Kyoto
      </h1>

<p className="text-gray-600 mt-6 max-w-3xl text-lg leading-8">        A curated 7-day immersion into Japan's cultural heart,
        blending ancient temples with modern culinary excellence.
      </p>

    </section>
  );
}