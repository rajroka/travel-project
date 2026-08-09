"use client";

import { FaSearch, FaSlidersH } from "react-icons/fa";

export default function SearchBar() {
  return (
    <section className="border-b border-gray-200 bg-white px-6 py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Explore Destinations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Find your perfect destination in Nepal.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2">
            <FaSearch className="text-gray-400" />

            <input
              type="text"
              placeholder="Search destinations..."
              className="w-52 outline-none text-sm"
            />
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <FaSlidersH />
            Filters
          </button>
        </div>
      </div>
    </section>
  );
}