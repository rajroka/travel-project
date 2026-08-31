"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AiBeautifyIcon,
  MapPinIcon,
  Calendar03Icon,
  DollarCircleIcon,
  StarIcon,
  ArrowRight01Icon,
  FloppyDiskIcon,
} from "hugeicons-react";

const INTERESTS = [
  "Adventure", "Nature", "Culture", "Trekking", "Wildlife",
  "Photography", "Spiritual", "Relaxation", "Food", "History",
];

interface GeneratedPlan {
  _id: string;
  input: { destination: string; days: number; budget: number; interests: string[] };
  generatedPlan: {
    recommendedPackages: Array<{
      _id: string;
      title: string;
      slug: string;
      price: number;
      duration: { days: number; nights: number };
    }>;
    itinerary: Array<{
      day: number;
      title: string;
      activities: string[];
      restaurants?: string[];
      accommodation?: string;
      estimatedCost?: number;
    }>;
    packingChecklist: string[];
    travelTips: string[];
    totalEstimatedCost: number;
    highlights: string[];
  };
  isSaved: boolean;
  planName?: string;
}

export default function AITripPlannerPage() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(4);
  const [budget, setBudget] = useState(500);
  const [interests, setInterests] = useState<string[]>([]);
  const [travelers, setTravelers] = useState(1);

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [planName, setPlanName] = useState("");
  const [activeTab, setActiveTab] = useState<"itinerary" | "packages" | "tips">("itinerary");

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    if (interests.length === 0) { setError("Please select at least one interest."); return; }
    setLoading(true);
    setError("");
    setPlan(null);

    const res = await fetch("/api/ai-planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ destination, days, budget, interests, numberOfTravelers: travelers }),
    });

    const json = await res.json() as { success: boolean; message: string; data?: { plan: GeneratedPlan } };
    setLoading(false);

    if (!json.success) { setError(json.message); return; }
    setPlan(json.data!.plan);
    setActiveTab("itinerary");
  }

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    await fetch(`/api/ai-planner/${plan._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isSaved: true, planName: planName || `${destination} Trip` }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700">
            <AiBeautifyIcon size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Trip Planner</h1>
          <p className="mt-2 text-gray-500 max-w-xl mx-auto">
            Tell us your preferences and our AI will create a personalised itinerary
            using our available tour packages.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">

          {/* â”€â”€ Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="lg:col-span-2">
            <form onSubmit={handleGenerate} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Destination <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPinIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Pokhara, Everest, Chitwan"
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <Calendar03Icon size={14} className="inline mr-1" /> Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Travelers</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <DollarCircleIcon size={14} className="inline mr-1" /> Budget (USD)
                </label>
                <input
                  type="number"
                  min={50}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-400">Total budget for all travelers</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Interests <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        interests.includes(i)
                          ? "bg-blue-700 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
              >
                <AiBeautifyIcon size={16} />
                {loading ? "Generating your planâ€¦" : "Generate My Plan"}
              </button>
            </form>

            {plan && (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-gray-700">Save this plan</p>
                {saved ? (
                  <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 text-center">
                    âœ“ Plan saved!{" "}
                    <Link href="/dashboard/ai-plans" className="underline font-medium">View saved plans</Link>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder={`${destination} Trip`}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 rounded-xl bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50 transition"
                    >
                      <FloppyDiskIcon size={15} />
                      {saving ? "â€¦" : "Save"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* â”€â”€ Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700 mb-4" />
                <p className="font-semibold text-gray-700">Generating your personalised planâ€¦</p>
                <p className="mt-1 text-sm text-gray-400">This may take a few seconds</p>
              </div>
            )}

            {!loading && !plan && (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <AiBeautifyIcon size={48} className="mb-4 text-gray-300" />
                <p className="font-semibold text-gray-500">Your plan will appear here</p>
                <p className="mt-1 text-sm text-gray-400">Fill in your preferences and click Generate</p>
              </div>
            )}

            {plan && (
              <div className="space-y-5">
                {/* Plan header */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-gray-900">
                        {plan.input.days}-Day {plan.input.destination} Trip
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        ${plan.input.budget} budget Â· {plan.input.travelers ?? 1} traveler(s) Â·{" "}
                        {plan.input.interests.join(", ")}
                      </p>
                    </div>
                    {plan.generatedPlan.totalEstimatedCost > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Est. total cost</p>
                        <p className="text-lg font-bold text-blue-700">
                          ${plan.generatedPlan.totalEstimatedCost}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-gray-100">
                  {(["itinerary", "packages", "tips"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 rounded-lg py-2.5 text-sm font-medium capitalize transition ${
                        activeTab === tab ? "bg-blue-700 text-white" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {tab === "packages" ? "Packages" : tab}
                    </button>
                  ))}
                </div>

                {/* Itinerary */}
                {activeTab === "itinerary" && (
                  <div className="space-y-3">
                    {plan.generatedPlan.itinerary.map((day) => (
                      <div key={day.day} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                            {day.day}
                          </span>
                          <h3 className="font-semibold text-gray-900">{day.title}</h3>
                          {day.estimatedCost && (
                            <span className="ml-auto text-sm font-medium text-green-600">
                              ~${day.estimatedCost}
                            </span>
                          )}
                        </div>
                        <ul className="space-y-1 mb-3">
                          {day.activities.map((a) => (
                            <li key={a} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="text-blue-400">Â·</span> {a}
                            </li>
                          ))}
                        </ul>
                        {(day.restaurants ?? []).length > 0 && (
                          <p className="text-xs text-gray-400">
                            ðŸ½ {day.restaurants!.join(", ")}
                          </p>
                        )}
                        {day.accommodation && (
                          <p className="text-xs text-gray-400 mt-1">ðŸ¨ {day.accommodation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended packages */}
                {activeTab === "packages" && (
                  <div>
                    {plan.generatedPlan.recommendedPackages.length === 0 ? (
                      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
                        <p className="text-gray-400">No matching packages found. Try broadening your interests.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {plan.generatedPlan.recommendedPackages.map((pkg) => (
                          <div key={pkg._id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div>
                              <h3 className="font-semibold text-gray-900">{pkg.title}</h3>
                              <p className="text-sm text-gray-400">
                                {pkg.duration.days}D / {pkg.duration.nights}N Â· ${pkg.price}/person
                              </p>
                            </div>
                            <Link
                              href={`/booking/${pkg.slug}`}
                              className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                            >
                              Book <ArrowRight01Icon size={14} />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tips & checklist */}
                {activeTab === "tips" && (
                  <div className="space-y-5">
                    {plan.generatedPlan.travelTips.length > 0 && (
                      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 font-semibold text-gray-900">Travel Tips</h3>
                        <ul className="space-y-2">
                          {plan.generatedPlan.travelTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="mt-0.5 flex-shrink-0 text-blue-500">ðŸ’¡</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {plan.generatedPlan.packingChecklist.length > 0 && (
                      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 font-semibold text-gray-900">Packing Checklist</h3>
                        <ul className="grid grid-cols-2 gap-2">
                          {plan.generatedPlan.packingChecklist.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="text-green-500">â˜</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
