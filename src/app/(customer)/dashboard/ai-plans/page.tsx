"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StarIcon, Location01Icon, Delete01Icon } from "hugeicons-react";

interface Plan {
  _id: string;
  planName?: string;
  input: { destination: string; days: number; budget: number; interests: string[] };
  isSaved: boolean;
  createdAt: string;
}

export default function AIPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai-planner", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setPlans(json.data.plans); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function deletePlan(id: string) {
    await fetch(`/api/ai-planner/${id}`, { method: "DELETE", credentials: "include" });
    setPlans((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Saved AI Trip Plans</h1>
        <Link href="/ai-planner" className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition">
          <StarIcon size={16} /> New Plan
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-16 text-center shadow-sm">
          <StarIcon size={56} className="mb-3 text-gray-300" />
          <p className="text-gray-500">No saved plans yet.</p>
          <Link href="/ai-planner" className="mt-3 rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition">
            Create your first plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((p) => (
            <div key={p._id} className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">
                  {p.planName ?? p.input.destination}
                </h3>
                <button onClick={() => deletePlan(p._id)} className="text-gray-300 hover:text-red-500 transition" title="Delete plan">
                  <Delete01Icon size={16} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Location01Icon size={14} />{p.input.destination}</span>
                <span>{p.input.days} days</span>
                <span>${p.input.budget} budget</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.input.interests.map((i) => (
                  <span key={i} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{i}</span>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
              <Link href={`/ai-planner/${p._id}`} className="mt-3 block text-sm text-blue-600 hover:underline">
                View full plan â†’
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
