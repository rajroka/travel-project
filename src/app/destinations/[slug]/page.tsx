"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import {
  MapPinIcon, ArrowLeft01Icon, HeartAddIcon,
  HeartCheckIcon, Calendar03Icon, ArrowRight01Icon,
} from "hugeicons-react";
import { useSession } from "@/lib/auth/auth-client";

interface Destination {
  _id: string; name: string; slug: string;
  description: string; shortDescription?: string;
  coverImage?: string; images?: string[];
  location: { address?: string; city: string; country: string };
  bestSeason?: string[]; highlights?: string[];
  averageRating: number; totalReviews: number; isFeatured: boolean;
}

interface Package {
  _id: string; title: string; slug: string;
  coverImage?: string; price: number; discountPrice?: number;
  duration: { days: number; nights: number };
}

interface Review {
  _id: string;
  user: { firstName: string; lastName?: string };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  adminResponse?: { comment: string };
}

type SessionUser = { name?: string | null; email?: string | null; image?: string | null; role?: string };

function StarPicker({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i} type="button"
          disabled={disabled}
          onMouseEnter={() => !disabled && setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !disabled && onChange(i)}
          className="transition disabled:cursor-not-allowed"
        >
          <FaStar size={22} className={(hover || value) >= i ? "text-amber-400" : "text-gray-300"} />
        </button>
      ))}
    </div>
  );
}

export default function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;

  const [dest, setDest] = useState<Destination | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const isCustomer = user?.role === "user";
  const isStaffOrAdmin = user?.role === "admin" || user?.role === "staff";

  useEffect(() => {
    const controller = new AbortController();
    
    fetch(`/api/destinations/${slug}`, { signal: controller.signal })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          const d = j.data.destination;
          setDest(d);
          if (d._id) {
            // Related packages
            fetch(`/api/packages?destination=${d._id}&limit=3`, { signal: controller.signal })
              .then(r => r.json())
              .then(pj => { if (pj.success) setPackages(pj.data.packages); })
              .catch(err => { if (err.name !== 'AbortError') console.error(err); });
            // Reviews
            setReviewsLoading(true);
            fetch(`/api/reviews?destinationId=${d._id}&limit=10&sort=newest`, { signal: controller.signal })
              .then(r => r.json())
              .then(rj => { if (rj.success) setReviews(rj.data.reviews); })
              .catch(err => { if (err.name !== 'AbortError') console.error(err); })
              .finally(() => setReviewsLoading(false));
            // Favourites
            fetch("/api/favorites?limit=100", { credentials: "include", signal: controller.signal })
              .then(r => r.ok ? r.json() : null)
              .then(fj => {
                if (!fj?.success) return;
                setIsFav(fj.data.favorites.some((f: { destination: { _id: string } | string | null }) => {
                  const fd = f.destination;
                  return typeof fd === "string" ? fd === d._id : fd?._id === d._id;
                }));
              })
              .catch(err => { if (err.name !== 'AbortError') console.error(err); });
          }
        }
      })
      .catch(err => { if (err.name !== 'AbortError') console.error(err); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  async function toggleFav() {
    if (!dest || favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ destinationId: dest._id }) });
        setIsFav(false);
      } else {
        await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ destinationId: dest._id }) });
        setIsFav(true);
      }
    } catch { /* */ }
    setFavLoading(false);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!isCustomer) return;
    if (rating === 0) { setReviewError("Please select a star rating."); return; }
    if (!comment.trim()) { setReviewError("Please write a comment."); return; }
    setSubmitting(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ destinationId: dest!._id, rating, title: title.trim() || undefined, comment: comment.trim() }),
      });
      const j = await res.json() as { success: boolean; message?: string; data?: { review: Review } };
      if (!j.success) { setReviewError(j.message ?? "Failed to submit review."); return; }
      setReviews(prev => [j.data!.review, ...prev]);
      setRating(0); setTitle(""); setComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-[60vh] bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-4">
        <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
        <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );

  if (!dest) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-gray-50">
      <p className="text-gray-500">Destination not found.</p>
      <Link href="/destinations" className="text-sm text-blue-600 hover:underline">Browse all destinations</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-8">

        <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft01Icon size={16} /> All Destinations
        </button>

        {/* Hero — full cover image, no side gaps */}
        <div className="mb-8 overflow-hidden rounded-2xl shadow-sm">
          <div className="relative h-64 w-full bg-gradient-to-br from-blue-100 to-indigo-200 sm:h-80">
            {dest.coverImage
              ? <Image src={dest.coverImage} alt={dest.name} fill className="object-cover" sizes="100vw" priority />
              : <div className="flex h-full items-center justify-center"><MapPinIcon size={52} className="text-blue-200" /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {dest.isFeatured && <span className="mb-2 inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-white">Featured</span>}
              <h1 className="text-2xl font-bold text-white line-clamp-2 sm:text-3xl">{dest.name}</h1>
              <div className="mt-1.5 flex flex-wrap gap-3 text-sm text-white/80">
                <span className="flex items-center gap-1"><MapPinIcon size={13} />{dest.location.city}, {dest.location.country}</span>
                {dest.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <FaStar size={11} className="text-amber-400" />
                    {dest.averageRating.toFixed(1)} ({dest.totalReviews} reviews)
                  </span>
                )}
              </div>
            </div>
            <button onClick={toggleFav} disabled={favLoading}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white disabled:opacity-50">
              {isFav ? <HeartCheckIcon size={20} className="text-red-500" /> : <HeartAddIcon size={20} className="text-gray-500" />}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">

            {/* About */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-3 break-words font-semibold text-gray-900">About {dest.name}</h2>
              <p className="break-words leading-7 text-gray-600">{dest.description}</p>
            </div>

            {/* Highlights */}
            {(dest.highlights ?? []).length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold text-gray-900">Highlights</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {dest.highlights!.map(h => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-blue-500">★</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related packages */}
            {packages.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Tour Packages</h2>
                  <Link href={`/packages?destination=${dest._id}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    View all <ArrowRight01Icon size={14} />
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {packages.map(pkg => (
                    <Link key={pkg._id} href={`/packages/${pkg.slug}`}
                      className="group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition hover:border-blue-200 hover:bg-blue-50">
                      <div className="relative h-28 w-full overflow-hidden bg-gray-200">
                        {pkg.coverImage
                          ? <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover transition group-hover:scale-105" sizes="200px" />
                          : <div className="flex h-full items-center justify-center"><MapPinIcon size={24} className="text-gray-300" /></div>
                        }
                      </div>
                      <div className="p-3">
                        <p className="break-words text-sm font-semibold text-gray-900 line-clamp-2">{pkg.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500 truncate">{pkg.duration.days}D · ${pkg.discountPrice ?? pkg.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Reviews (customer-only) ───────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-gray-900">
                Reviews {dest.totalReviews > 0 && <span className="ml-1 text-sm font-normal text-gray-400">({dest.totalReviews})</span>}
              </h2>

              {/* Write review form - only for customers */}
              {isCustomer ? (
                <form onSubmit={submitReview} className="mb-6 rounded-xl bg-gray-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-700">Write a Review</p>

                  {reviewSuccess && (
                    <div className="mb-3 rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
                      ✓ Review submitted! Thank you.
                    </div>
                  )}
                  {reviewError && (
                    <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                      {reviewError}
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="mb-1.5 text-xs font-medium text-gray-600">Your Rating *</p>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>

                  <div className="mb-3">
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Title (optional)</label>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Summarize your experience"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Comment *</label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your experience at this destination…"
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              ) : !session?.user ? (
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
                  <p className="mb-3 text-sm text-gray-700">Sign in to leave a review</p>
                  <Link href="/login" className="inline-block rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition">
                    Sign In
                  </Link>
                </div>
              ) : null}

              {/* Reviews list */}
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {r.user.firstName} {r.user.lastName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <div className="mt-1 flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <FaStar key={i} size={12} className={r.rating >= i ? "text-amber-400" : "text-gray-300"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {r.title && <p className="mt-2 text-sm font-medium text-gray-800">{r.title}</p>}
                      <p className="mt-1 text-sm text-gray-600 leading-6">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Quick Info</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPinIcon size={15} className="text-blue-500" />
                  {dest.location.city}, {dest.location.country}
                </div>
                {(dest.bestSeason ?? []).length > 0 && (
                  <div className="flex items-start gap-2">
                    <Calendar03Icon size={15} className="mt-0.5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Best Season</p>
                      <p className="text-gray-500">{dest.bestSeason!.join(", ")}</p>
                    </div>
                  </div>
                )}
                {dest.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <FaStar size={13} className="text-amber-400" />
                    <span>{dest.averageRating.toFixed(1)} / 5 · {dest.totalReviews} reviews</span>
                  </div>
                )}
              </div>
              <Link href={`/packages?destination=${dest._id}`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">
                View Packages <ArrowRight01Icon size={15} />
              </Link>
              <button onClick={toggleFav} disabled={favLoading}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition disabled:opacity-50 ${isFav ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {isFav ? <HeartCheckIcon size={16} /> : <HeartAddIcon size={16} />}
                {isFav ? "Saved to Favourites" : "Save to Favourites"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
