"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { MapPinIcon, PencilEdit01Icon, Delete01Icon } from "hugeicons-react";

const FALLBACK = [
  "/pexels-tkirkgoz-4750098.jpg",
  "/pexels-roman-saienko-1867764487-28831413.jpg",
  "/pexels-mr-dr3igeteilt-2159455987-36564643.jpg",
  "/gumba.jpg",
  "/hero-image.jpg",
];

export type ManageDestination = {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  shortDescription?: string;
  location: { city: string; country: string };
  bestSeason?: string[];
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          size={13}
          className={i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export function DestinationManageCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="h-56 animate-pulse bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function DestinationManageCard({
  destination: d,
  index = 0,
  deleting,
  onEdit,
  onDelete,
  onToggleFeatured,
}: {
  destination: ManageDestination;
  index?: number;
  deleting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
}) {
  const isRealPhoto =
    d.coverImage &&
    !d.coverImage.includes("Nepal.png") &&
    !d.coverImage.includes("nepal.png");
  const photo = isRealPhoto ? d.coverImage! : FALLBACK[index % FALLBACK.length];

  return (
    <article className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Image
          src={photo}
          alt={d.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        />
        {d.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            Featured
          </span>
        )}
        <div className="absolute right-3 top-3 z-10 flex gap-1.5">
          <button
            type="button"
            onClick={onToggleFeatured}
            title={d.isFeatured ? "Unfeature" : "Feature on homepage"}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition ${
              d.isFeatured
                ? "bg-yellow-400 text-white hover:bg-yellow-500"
                : "bg-white/90 text-gray-500 hover:bg-white"
            }`}
          >
            <FaStar size={13} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition hover:bg-white hover:text-blue-700"
          >
            <PencilEdit01Icon size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            title="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition hover:bg-white hover:text-red-600 disabled:opacity-40"
          >
            <Delete01Icon size={15} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link href={`/destinations/${d.slug}`}>
          <h3 className="break-words text-base font-bold leading-snug text-gray-900 line-clamp-2 transition-colors group-hover:text-blue-700">
            {d.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <Stars rating={d.averageRating > 0 ? d.averageRating : 0} />
          {d.averageRating > 0 && (
            <span className="text-sm text-gray-500">
              {d.totalReviews} {d.totalReviews === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
          <MapPinIcon size={14} className="flex-shrink-0 text-gray-500" />
          <span className="truncate">
            {d.location.city}, {d.location.country}
          </span>
        </div>

        <p className="mt-1.5 min-h-[40px] text-sm text-gray-500 line-clamp-2">
          {d.shortDescription ?? `Explore the breathtaking beauty of ${d.name}.`}
        </p>

        {d.bestSeason && d.bestSeason.length > 0 && (
          <p className="mt-2 truncate text-xs text-gray-400">
            Best in {d.bestSeason.slice(0, 2).join(" & ")}
          </p>
        )}
      </div>
    </article>
  );
}
