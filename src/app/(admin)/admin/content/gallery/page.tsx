"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Delete01Icon } from "hugeicons-react";

interface GalleryImage {
  _id: string;
  imageUrl: string;
  title?: string;
  category: string;
}

const CATEGORIES = ["all", "destination", "package", "banner", "general"];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  function fetchImages(cat: string) {
    setLoading(true);
    const q = cat !== "all" ? `?category=${cat}` : "";
    fetch(`/api/content/gallery${q}`)
      .then(r => r.json())
      .then(j => { if (j.success) setImages(j.data.images); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchImages(category); }, [category]);

  async function deleteImage(id: string) {
    setDeleting(id);
    await fetch("/api/content/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    setImages(prev => prev.filter(img => img._id !== id));
    setDeleting(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="mt-1 text-sm text-gray-500">Manage site images</p>
        </div>
      </div>

      <div className="mb-5 flex gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              category === c ? "bg-blue-700 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-video animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-14 text-center shadow-sm">
          <p className="text-gray-400">No images in this category.</p>
          <p className="mt-1 text-sm text-gray-400">Upload images via the Upload API.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map(img => (
            <div key={img._id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="relative aspect-video bg-gray-100">
                <Image src={img.imageUrl} alt={img.title ?? ""} fill className="object-cover" sizes="25vw" />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-gray-800">{img.title ?? "Untitled"}</p>
                <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">{img.category}</span>
              </div>
              <button
                onClick={() => deleteImage(img._id)}
                disabled={deleting === img._id}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-600 disabled:opacity-50"
                title="Delete"
              >
                <Delete01Icon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
