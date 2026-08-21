"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search01Icon, FilterIcon } from "hugeicons-react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&type=destination`);
    }
  }

  return (
    <section className="border-b border-gray-200 bg-white px-6 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Explore Destinations</h2>
          <p className="mt-1 text-sm text-gray-500">Find your perfect destination in Nepal.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Search01Icon size={16} className="text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations…"
              className="w-52 bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <Search01Icon size={15} /> Search
          </button>
        </form>
      </div>
    </section>
  );
}
