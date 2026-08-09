import {
  FaMapMarkerAlt,
  FaMountain,
  FaLandmark,
  FaLeaf,
} from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside className="w-[340px] bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">

      <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
        ✨ Plan Your Escape
      </h2>

      {/* Destination */}
      <div className="mb-5">
        <label className="block text-sm font-semibold mb-2">
          Where to?
        </label>

        <div className="flex items-center border rounded-xl px-4 py-3">
          <FaMapMarkerAlt className="text-gray-400 mr-3" />
          <input
            className="outline-none w-full"
            placeholder="e.g. Kyoto, Japan"
          />
        </div>
      </div>

      {/* Budget + Days */}
      <div className="grid grid-cols-2 gap-4 mb-5">

        <div>
          <label className="block text-sm font-semibold mb-2">
            Budget ($)
          </label>

          <input
            className="w-full border rounded-xl px-4 py-3 outline-none"
            defaultValue="2000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Days
          </label>

          <input
            className="w-full border rounded-xl px-4 py-3 outline-none"
            defaultValue="7"
          />
        </div>

      </div>

      {/* Interests */}

      <h3 className="font-semibold mb-3">
        Interests
      </h3>

      <div className="space-y-3">

        <button className="w-full border rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100">
          <FaMountain />
          Adventure
        </button>

        <button className="w-full rounded-xl p-4 flex items-center gap-3 bg-blue-700 text-white">
          <FaLandmark />
          Culture
        </button>

        <button className="w-full border rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100">
          <FaLeaf />
          Relaxation
        </button>

      </div>

      <button className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl  hover:scale-105 transition-all duration-300">
        Generate AI Plan
      </button>

      <div className="mt-8 bg-blue-50 rounded-xl p-4 text-sm text-gray-600 italic">
        "Our AI considers millions of travel reviews to craft your perfect itinerary."
      </div>

    </aside>
  );
}