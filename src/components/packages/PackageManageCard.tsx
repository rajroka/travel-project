"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FiDollarSign } from "react-icons/fi";
import {
  MapPinIcon,
  PencilEdit01Icon,
  Delete01Icon,
  ViewOffIcon,
  ViewIcon,
} from "hugeicons-react";

const FALLBACK = [
  "/pexels-tkirkgoz-4750098.jpg",
  "/pexels-roman-saienko-1867764487-28831413.jpg",
  "/pexels-mr-dr3igeteilt-2159455987-36564643.jpg",
  "/gumba.jpg",
  "/hero-image.jpg",
];

export type ManagePackage = {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
  averageRating: number;
  totalReviews?: number;
  totalBookings?: number;
  isActive: boolean;
  isPromotional: boolean;
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

export function PackageManageCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="h-56 animate-pulse bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function PackageManageCard({
  pkg,
  index = 0,
  deleting,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  pkg: ManagePackage;
  index?: number;
  deleting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const isRealPhoto =
    pkg.coverImage &&
    !pkg.coverImage.includes("Nepal.png") &&
    !pkg.coverImage.includes("nepal.png");
  const photo = isRealPhoto ? pkg.coverImage! : FALLBACK[index % FALLBACK.length];
  const displayPrice = pkg.discountPrice ?? pkg.price;
  const reviewCount = pkg.totalReviews ?? 0;

  return (
    <article
      className={`group overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md ${
        !pkg.isActive ? "opacity-70" : ""
      }`}
    >
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Image
          src={photo}
          alt={pkg.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        />
        {!pkg.isActive && (
          <span className="absolute left-3 top-3 rounded-full bg-gray-800/80 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Inactive
          </span>
        )}
        {pkg.isPromotional && (
          <span className="absolute left-3 bottom-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Sale
          </span>
        )}
        <div className="absolute right-3 top-3 z-10 flex gap-1.5">
          <button
            type="button"
            onClick={onToggleActive}
            title={pkg.isActive ? "Deactivate" : "Activate"}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition ${
              pkg.isActive
                ? "bg-white/90 text-gray-600 hover:bg-white hover:text-amber-600"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {pkg.isActive ? <ViewOffIcon size={15} /> : <ViewIcon size={15} />}
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
        <Link href={`/packages/${pkg.slug}`}>
          <h3 className="break-words text-base font-bold leading-snug text-gray-900 line-clamp-2 transition-colors group-hover:text-blue-700">
            {pkg.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <Stars rating={pkg.averageRating > 0 ? pkg.averageRating : 0} />
          {pkg.averageRating > 0 && (
            <span className="text-sm text-gray-500">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 truncate text-sm text-gray-600">
          <MapPinIcon size={14} className="flex-shrink-0 text-gray-500" />
          <span className="truncate">Duration: {pkg.duration.days} days</span>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 truncate text-sm font-medium text-gray-700">
          <FiDollarSign size={14} className="flex-shrink-0 text-gray-500" />
          <span className="truncate">
            Starting From: USD {displayPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
}
