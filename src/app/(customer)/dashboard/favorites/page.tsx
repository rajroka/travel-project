"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartCheckIcon, MapPinIcon } from "hugeicons-react";

interface Favorite {
  _id: string;
  destination: {
    _id: string;
    name: string;
    slug: string;
    coverImage?: string;
    location: { city: string; country: string };
    averageRating: number;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setFavorites(json.data.favorites); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function remove(favoriteId: string) {
    await fetch("/api/favorites/" + favoriteId, { method: "DELETE", credentials: "include" });
    setFavorites((prev) => prev.filter((f) => f._id !== favoriteId));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Saved Favourites</h1>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-16 text-center shadow-sm">
          <HeartCheckIcon size={56} className="mb-3 text-gray-300" />
          <p className="text-gray-400">No saved destinations yet.</p>
          <Link href="/destinations" className="mt-3 text-sm text-blue-600 hover:underline">Explore destinations â†’</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {favorites.map((f) => (
            <div key={f._id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="h-36 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                {f.destination.coverImage ? (
                  <img src={f.destination.coverImage} alt={f.destination.name} className="h-full w-full object-cover" />
                ) : (
                  <MapPinIcon size={48} className="text-blue-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{f.destination.name}</h3>
                <p className="text-sm text-gray-400">{f.destination.location.city}, {f.destination.location.country}</p>
              </div>
              <button
                onClick={() => remove(f._id)}
                className="absolute right-3 top-3 rounded-full bg-white p-1.5 text-red-500 shadow hover:bg-red-50 transition"
                title="Remove from favourites"
              >
                <HeartCheckIcon size={16} className="text-red-500 fill-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
