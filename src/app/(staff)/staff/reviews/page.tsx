"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { EyeIcon } from "hugeicons-react";

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  isHidden: boolean;
  createdAt: string;
  user: { name?: string; email: string };
  package: { title: string };
  adminResponse?: { comment: string };
}

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews?limit=50", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setReviews(j.data.reviews); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function hideReview(id: string, hide: boolean) {
    setUpdating(id);
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ action: hide ? "hide" : "show" }),
    });
    setReviews((prev) => prev.map((r) => r._id === id ? { ...r, isHidden: hide } : r));
    setUpdating(null);
  }

  async function submitResponse(id: string) {
    if (!responseText.trim()) return;
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ action: "respond", comment: responseText }),
    });
    setReviews((prev) => prev.map((r) => r._id === id ? { ...r, adminResponse: { comment: responseText } } : r));
    setResponding(null);
    setResponseText("");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">Manage customer reviews</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-14 text-center shadow-sm">
          <EyeIcon size={48} className="mb-3 text-gray-300" />
          <p className="text-gray-400">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className={`rounded-2xl border bg-white p-5 shadow-sm ${r.isHidden ? "opacity-60" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => <FaStar key={s} size={13} className={s <= r.rating ? "text-amber-400" : "text-gray-200"} />)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{r.user?.name ?? r.user?.email}</span>
                    <span className="text-xs text-gray-400">on <span className="italic">{r.package?.title}</span></span>
                  </div>
                  {r.title && <p className="mt-2 font-semibold text-gray-900">{r.title}</p>}
                  <p className="mt-1 text-sm text-gray-600">{r.comment}</p>
                  {r.adminResponse && (
                    <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      <span className="font-semibold">Staff response: </span>{r.adminResponse.comment}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!r.adminResponse && (
                    <button onClick={() => setResponding(responding === r._id ? null : r._id)}
                      className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 transition">
                      Respond
                    </button>
                  )}
                  <button onClick={() => hideReview(r._id, !r.isHidden)} disabled={updating === r._id}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50 ${r.isHidden ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                    {updating === r._id ? "…" : r.isHidden ? "Show" : "Hide"}
                  </button>
                </div>
              </div>
              {responding === r._id && (
                <div className="mt-4 flex gap-2">
                  <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response…" rows={2}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 resize-none" />
                  <button onClick={() => submitResponse(r._id)}
                    className="rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 transition">Send</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
