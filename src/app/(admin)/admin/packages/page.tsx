"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  PackageIcon,
  Delete01Icon,
  PencilEdit01Icon,
  Add01Icon,
  Cancel01Icon,
  FloppyDiskIcon,
} from "hugeicons-react";
import { FaStar } from "react-icons/fa";
import ImageUpload from "@/components/ui/ImageUpload";

interface Destination { _id: string; name: string; slug: string }

interface Package {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  description: string;
  shortDescription?: string;
  destination: Destination | string;
  price: number;
  discountPrice?: number;
  duration: { days: number; nights: number };
  maxTravelers: number;
  minTravelers?: number;
  difficultyLevel?: string;
  includedServices: string[];
  excludedServices?: string[];
  highlights?: string[];
  requirements?: string[];
  itinerary?: { day: number; title: string; description: string; activities?: string[] }[];
  isActive: boolean;
  isPromotional: boolean;
  promotionExpiry?: string;
  averageRating: number;
  totalBookings: number;
}

const DIFFICULTY = ["easy", "moderate", "challenging"] as const;

const EMPTY_FORM = {
  title: "",
  description: "",
  shortDescription: "",
  coverImage: "",
  destination: "",      // stores the _id
  destSearch: "",       // stores the display name while typing
  price: "",
  discountPrice: "",
  durationDays: "1",
  durationNights: "0",
  maxTravelers: "10",
  minTravelers: "1",
  difficultyLevel: "easy" as string,
  includedServices: [""],
  excludedServices: [""],
  highlights: [""],
  requirements: [""],
  isPromotional: false,
  promotionExpiry: "",
  itinerary: [{ day: 1, title: "", description: "", activities: [""] }],
};

type FormState = typeof EMPTY_FORM;

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showDestList, setShowDestList] = useState(false);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestList(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadDestinations() {
    const r = await fetch("/api/destinations?limit=100");
    const j = await r.json();
    if (j.success) setDestinations(j.data.destinations);
  }

  useEffect(() => {
    load();
    loadDestinations();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/packages?limit=100", { credentials: "include" });
      const j = await r.json();
      if (j.success) setPackages(j.data.packages);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    loadDestinations(); // refresh so newly-created destinations appear
    setForm(EMPTY_FORM);
    setEditSlug(null);
    setError("");
    setOpen(true);
  }

  function openEdit(p: Package) {
    const destId = typeof p.destination === "object" ? p.destination._id : p.destination;
    const destName = typeof p.destination === "object" ? p.destination.name : (destinations.find(d => d._id === p.destination)?.name ?? "");
    setForm({
      title: p.title,
      description: p.description,
      shortDescription: p.shortDescription ?? "",
      coverImage: p.coverImage ?? "",
      destination: destId,
      destSearch: destName,
      price: String(p.price),
      discountPrice: String(p.discountPrice ?? ""),
      durationDays: String(p.duration.days),
      durationNights: String(p.duration.nights),
      maxTravelers: String(p.maxTravelers),
      minTravelers: String(p.minTravelers ?? 1),
      difficultyLevel: p.difficultyLevel ?? "easy",
      includedServices: p.includedServices.length ? p.includedServices : [""],
      excludedServices: p.excludedServices?.length ? p.excludedServices : [""],
      highlights: p.highlights?.length ? p.highlights : [""],
      requirements: p.requirements?.length ? p.requirements : [""],
      isPromotional: p.isPromotional,
      promotionExpiry: p.promotionExpiry ? p.promotionExpiry.slice(0, 10) : "",
      itinerary: p.itinerary?.length
        ? p.itinerary.map(d => ({ ...d, activities: d.activities?.length ? d.activities : [""] }))
        : [{ day: 1, title: "", description: "", activities: [""] }],
    });
    setEditSlug(p.slug);
    setError("");
    setOpen(true);
  }

  function close() { setOpen(false); setEditSlug(null); setError(""); }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // ── list helpers ──────────────────────────────────────────────────────────
  function setListItem(key: "includedServices" | "excludedServices" | "highlights" | "requirements", i: number, v: string) {
    setForm(prev => {
      const arr = [...(prev[key] as string[])];
      arr[i] = v;
      return { ...prev, [key]: arr };
    });
  }

  function addListItem(key: "includedServices" | "excludedServices" | "highlights" | "requirements") {
    setForm(prev => ({ ...prev, [key]: [...(prev[key] as string[]), ""] }));
  }

  function removeListItem(key: "includedServices" | "excludedServices" | "highlights" | "requirements", i: number) {
    setForm(prev => ({ ...prev, [key]: (prev[key] as string[]).filter((_, idx) => idx !== i) }));
  }

  // ── itinerary helpers ─────────────────────────────────────────────────────
  function setItinField(di: number, key: "title" | "description", v: string) {
    setForm(prev => {
      const it = prev.itinerary.map((d, idx) => idx === di ? { ...d, [key]: v } : d);
      return { ...prev, itinerary: it };
    });
  }

  function setItinActivity(di: number, ai: number, v: string) {
    setForm(prev => {
      const it = prev.itinerary.map((d, idx) => {
        if (idx !== di) return d;
        const acts = [...(d.activities ?? [])];
        acts[ai] = v;
        return { ...d, activities: acts };
      });
      return { ...prev, itinerary: it };
    });
  }

  function addItinActivity(di: number) {
    setForm(prev => {
      const it = prev.itinerary.map((d, idx) =>
        idx === di ? { ...d, activities: [...(d.activities ?? []), ""] } : d
      );
      return { ...prev, itinerary: it };
    });
  }

  function removeItinActivity(di: number, ai: number) {
    setForm(prev => {
      const it = prev.itinerary.map((d, idx) =>
        idx === di ? { ...d, activities: (d.activities ?? []).filter((_, i) => i !== ai) } : d
      );
      return { ...prev, itinerary: it };
    });
  }

  function addItinDay() {
    setForm(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: "", description: "", activities: [""] }],
    }));
  }

  function removeItinDay(di: number) {
    setForm(prev => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, idx) => idx !== di)
        .map((d, idx) => ({ ...d, day: idx + 1 })),
    }));
  }

  async function handleSave() {
    const priceNum = Number(form.price);
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.destination.trim()) { setError("Please select a destination."); return; }
    if (!form.price || isNaN(priceNum) || priceNum <= 0) { setError("Price must be greater than 0."); return; }
    setSaving(true);
    setError("");
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        ...(form.coverImage.trim() ? { coverImage: form.coverImage.trim() } : {}),
        destination: form.destination,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        duration: { days: Number(form.durationDays), nights: Number(form.durationNights) },
        maxTravelers: Number(form.maxTravelers),
        minTravelers: Number(form.minTravelers),
        difficultyLevel: form.difficultyLevel,
        includedServices: form.includedServices.filter(s => s.trim()),
        excludedServices: form.excludedServices.filter(s => s.trim()),
        highlights: form.highlights.filter(s => s.trim()),
        requirements: form.requirements.filter(s => s.trim()),
        isPromotional: form.isPromotional,
        promotionExpiry: form.promotionExpiry || undefined,
        itinerary: form.itinerary
          .filter(d => d.title.trim() && d.description.trim())
          .map(d => ({ ...d, activities: (d.activities ?? []).filter(a => a.trim()) })),
      };

      const url = editSlug ? `/api/packages/${editSlug}` : "/api/packages";
      const method = editSlug ? "PATCH" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const j = await r.json() as { success: boolean; message?: string; errors?: Record<string, string[]> };
      if (!j.success) {
        // Show field-level errors if available
        if (j.errors) {
          const msgs = Object.entries(j.errors)
            .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
            .join(" | ");
          setError(msgs || j.message || "Validation error");
        } else {
          setError(j.message ?? "Failed to save.");
        }
        return;
      }
      close();
      load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Delete this package? It will be hidden from the public.")) return;
    setDeleting(slug);
    await fetch(`/api/packages/${slug}`, { method: "DELETE", credentials: "include" });
    setPackages(prev => prev.filter(p => p.slug !== slug));
    setDeleting(null);
  }

  async function toggleActive(p: Package) {
    await fetch(`/api/packages/${p.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    setPackages(prev => prev.map(x => x.slug === p.slug ? { ...x, isActive: !x.isActive } : x));
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Packages</h1>
          <p className="mt-0.5 text-sm text-gray-500">{packages.length} packages</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition"
        >
          <Add01Icon size={16} /> Add Package
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-16 text-center shadow-sm">
          <PackageIcon size={48} className="mb-3 text-gray-300" />
          <p className="text-gray-400">No packages yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map(p => (
            <div
              key={p._id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${!p.isActive ? "opacity-60" : "border-gray-100"}`}
            >
              <div className="relative h-40 bg-gradient-to-br from-green-100 to-teal-200">
                {p.coverImage ? (
                  <Image src={p.coverImage} alt={p.title} fill className="object-cover" sizes="33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PackageIcon size={40} className="text-green-300" />
                  </div>
                )}
                {!p.isActive && (
                  <span className="absolute left-2 top-2 rounded-full bg-gray-700/80 px-2 py-0.5 text-xs text-white">Inactive</span>
                )}
                {p.isPromotional && (
                  <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">Sale</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-xs text-gray-400">
                      {p.duration.days}D / {p.duration.nights}N ·{" "}
                      <span className="font-medium text-gray-700">
                        ${p.discountPrice ?? p.price}
                        {p.discountPrice && <span className="ml-1 line-through text-gray-400">${p.price}</span>}
                      </span>
                    </p>
                    {p.averageRating > 0 && (
                      <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <FaStar size={10} className="text-amber-400" /> {p.averageRating.toFixed(1)} · {p.totalBookings} bookings
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                        p.isActive
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {p.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <PencilEdit01Icon size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.slug)}
                      disabled={deleting === p.slug}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-40"
                    >
                      <Delete01Icon size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Drawer ─────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={close} />
          <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            {/* header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editSlug ? "Edit Package" : "Add Package"}
              </h2>
              <button onClick={close} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <Cancel01Icon size={18} />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin-light">
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>
              )}

              {/* Basic info */}
              <Section title="Basic Info">
                <Field label="Package Title *">
                  <input value={form.title} onChange={e => setField("title", e.target.value)} placeholder="e.g. Annapurna Circuit Trek" className={inp} />
                </Field>
                <Field label="Short Description">
                  <input value={form.shortDescription} onChange={e => setField("shortDescription", e.target.value)} placeholder="One-liner shown in cards" className={inp} />
                </Field>
                <Field label="Full Description *">
                  <textarea rows={4} value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Detailed description…" className={inp} />
                </Field>
                <Field label="Cover Image">
                  <ImageUpload
                    value={form.coverImage}
                    onChange={(url) => setField("coverImage", url)}
                    folder="packages"
                    aspectRatio="aspect-video"
                  />
                </Field>
              </Section>

              <Section title="Destination">
                <Field label="Destination *">
                  <div ref={destRef} className="relative">
                    <input
                      value={form.destSearch}
                      onChange={e => {
                        setField("destSearch", e.target.value);
                        setField("destination", "");
                        setShowDestList(true);
                      }}
                      onFocus={() => setShowDestList(true)}
                      placeholder="Type to search destinations…"
                      className={inp}
                      autoComplete="off"
                    />
                    {form.destination && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        ✓ selected
                      </span>
                    )}
                    {showDestList && (
                      <div className="absolute left-0 top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                        {destinations
                          .filter(d =>
                            !form.destSearch.trim() ||
                            d.name.toLowerCase().includes(form.destSearch.toLowerCase())
                          )
                          .map(d => (
                            <button
                              key={d._id}
                              type="button"
                              onMouseDown={e => {
                                e.preventDefault();
                                setForm(prev => ({ ...prev, destination: d._id, destSearch: d.name }));
                                setShowDestList(false);
                              }}
                              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-blue-50 ${
                                form.destination === d._id ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-800"
                              }`}
                            >
                              {d.name}
                            </button>
                          ))}
                        {destinations.filter(d =>
                          !form.destSearch.trim() ||
                          d.name.toLowerCase().includes(form.destSearch.toLowerCase())
                        ).length === 0 && (
                          <p className="px-4 py-3 text-sm text-gray-400">
                            No destinations found. Create one in the Destinations page first.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Field>
              </Section>

              {/* Pricing */}
              <Section title="Pricing">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price (USD) *">
                    <input type="number" min="0" value={form.price} onChange={e => setField("price", e.target.value)} placeholder="500" className={inp} />
                  </Field>
                  <Field label="Discount Price">
                    <input type="number" min="0" value={form.discountPrice} onChange={e => setField("discountPrice", e.target.value)} placeholder="450" className={inp} />
                  </Field>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 mt-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Promotional Package</p>
                    <p className="text-xs text-gray-500">Shows a &quot;Sale&quot; badge on the card</p>
                  </div>
                  <Toggle value={form.isPromotional} onChange={v => setField("isPromotional", v)} />
                </div>
                {form.isPromotional && (
                  <Field label="Promotion Expiry Date">
                    <input type="date" value={form.promotionExpiry} onChange={e => setField("promotionExpiry", e.target.value)} className={inp} />
                  </Field>
                )}
              </Section>

              {/* Duration & Capacity */}
              <Section title="Duration & Capacity">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Days *">
                    <input type="number" min="1" value={form.durationDays} onChange={e => setField("durationDays", e.target.value)} className={inp} />
                  </Field>
                  <Field label="Nights *">
                    <input type="number" min="0" value={form.durationNights} onChange={e => setField("durationNights", e.target.value)} className={inp} />
                  </Field>
                  <Field label="Max Travelers *">
                    <input type="number" min="1" value={form.maxTravelers} onChange={e => setField("maxTravelers", e.target.value)} className={inp} />
                  </Field>
                  <Field label="Min Travelers">
                    <input type="number" min="1" value={form.minTravelers} onChange={e => setField("minTravelers", e.target.value)} className={inp} />
                  </Field>
                </div>
                <Field label="Difficulty Level">
                  <div className="flex gap-2">
                    {DIFFICULTY.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setField("difficultyLevel", d)}
                        className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition ${
                          form.difficultyLevel === d
                            ? "bg-blue-700 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </Field>
              </Section>

              {/* Services */}
              <Section title="Included Services">
                <TagList
                  items={form.includedServices}
                  placeholder="e.g. Accommodation"
                  onChange={(i, v) => setListItem("includedServices", i, v)}
                  onAdd={() => addListItem("includedServices")}
                  onRemove={i => removeListItem("includedServices", i)}
                />
              </Section>

              <Section title="Excluded Services">
                <TagList
                  items={form.excludedServices}
                  placeholder="e.g. International flights"
                  onChange={(i, v) => setListItem("excludedServices", i, v)}
                  onAdd={() => addListItem("excludedServices")}
                  onRemove={i => removeListItem("excludedServices", i)}
                />
              </Section>

              <Section title="Highlights">
                <TagList
                  items={form.highlights}
                  placeholder="e.g. Stunning mountain views"
                  onChange={(i, v) => setListItem("highlights", i, v)}
                  onAdd={() => addListItem("highlights")}
                  onRemove={i => removeListItem("highlights", i)}
                />
              </Section>

              <Section title="Requirements">
                <TagList
                  items={form.requirements}
                  placeholder="e.g. Basic fitness level"
                  onChange={(i, v) => setListItem("requirements", i, v)}
                  onAdd={() => addListItem("requirements")}
                  onRemove={i => removeListItem("requirements", i)}
                />
              </Section>

              {/* Itinerary */}
              <Section title="Itinerary (Day-by-Day)">
                <div className="space-y-4">
                  {form.itinerary.map((day, di) => (
                    <div key={di} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-700">Day {day.day}</span>
                        {form.itinerary.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItinDay(di)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Cancel01Icon size={14} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          value={day.title}
                          onChange={e => setItinField(di, "title", e.target.value)}
                          placeholder="Day title (e.g. Trek to Base Camp)"
                          className={inp}
                        />
                        <textarea
                          rows={2}
                          value={day.description}
                          onChange={e => setItinField(di, "description", e.target.value)}
                          placeholder="Description of the day…"
                          className={inp}
                        />
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-gray-500">Activities</p>
                          {(day.activities ?? [""]).map((act, ai) => (
                            <div key={ai} className="mb-1.5 flex gap-2">
                              <input
                                value={act}
                                onChange={e => setItinActivity(di, ai, e.target.value)}
                                placeholder={`Activity ${ai + 1}`}
                                className={`${inp} flex-1`}
                              />
                              {(day.activities ?? []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItinActivity(di, ai)}
                                  className="rounded-lg p-1.5 text-gray-400 hover:text-red-500"
                                >
                                  <Cancel01Icon size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addItinActivity(di)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            + Add activity
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItinDay}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <Add01Icon size={14} /> Add day
                  </button>
                </div>
              </Section>
            </div>

            {/* footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={close}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                <FloppyDiskIcon size={15} />
                {saving ? "Saving…" : editSlug ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── small reusable components ──────────────────────────────────────────────
const inp =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition ${value ? "bg-blue-700" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function TagList({
  items,
  placeholder,
  onChange,
  onAdd,
  onRemove,
}: {
  items: string[];
  placeholder: string;
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={e => onChange(i, e.target.value)}
            placeholder={placeholder}
            className={`${inp} flex-1`}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <Cancel01Icon size={14} />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={onAdd} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
        <Add01Icon size={14} /> Add item
      </button>
    </div>
  );
}
