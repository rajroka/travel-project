"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  MapPinIcon,
  Delete01Icon,
  PencilEdit01Icon,
  Add01Icon,
  Cancel01Icon,
  FloppyDiskIcon,
} from "hugeicons-react";
import { FaStar } from "react-icons/fa";
import ImageUpload from "@/components/ui/ImageUpload";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  description: string;
  shortDescription?: string;
  location: { address?: string; city: string; country: string; coordinates?: { lat: number; lng: number } };
  bestSeason?: string[];
  highlights?: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
}

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

const EMPTY_FORM = {
  name: "",
  description: "",
  shortDescription: "",
  coverImage: "",
  location: { address: "", city: "", country: "Nepal" },
  bestSeason: [] as string[],
  highlights: [""],
  isFeatured: false,
};

type FormState = typeof EMPTY_FORM;

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // drawer state
  const [open, setOpen] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/destinations?limit=100&isActive=true", { credentials: "include" });
      const j = await r.json();
      if (j.success) setDestinations(j.data.destinations);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditSlug(null);
    setError("");
    setOpen(true);
  }

  function openEdit(d: Destination) {
    setForm({
      name: d.name,
      description: d.description,
      shortDescription: d.shortDescription ?? "",
      coverImage: d.coverImage ?? "",
      location: {
        address: d.location.address ?? "",
        city: d.location.city,
        country: d.location.country,
      },
      bestSeason: d.bestSeason ?? [],
      highlights: d.highlights?.length ? d.highlights : [""],
      isFeatured: d.isFeatured,
    });
    setEditSlug(d.slug);
    setError("");
    setOpen(true);
  }

  function close() { setOpen(false); setEditSlug(null); setError(""); }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function setLocation(key: keyof FormState["location"], value: string) {
    setForm(prev => ({ ...prev, location: { ...prev.location, [key]: value } }));
  }

  function toggleSeason(s: string) {
    setForm(prev => ({
      ...prev,
      bestSeason: prev.bestSeason.includes(s)
        ? prev.bestSeason.filter(x => x !== s)
        : [...prev.bestSeason, s],
    }));
  }

  function setHighlight(i: number, v: string) {
    setForm(prev => {
      const h = [...prev.highlights];
      h[i] = v;
      return { ...prev, highlights: h };
    });
  }

  function addHighlight() {
    setForm(prev => ({ ...prev, highlights: [...prev.highlights, ""] }));
  }

  function removeHighlight(i: number) {
    setForm(prev => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.description.trim() || !form.location.city.trim() || !form.location.country.trim()) {
      setError("Name, description, city and country are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        ...(form.coverImage.trim() ? { coverImage: form.coverImage.trim() } : {}),
        location: {
          address: form.location.address?.trim() || undefined,
          city: form.location.city.trim(),
          country: form.location.country.trim(),
        },
        bestSeason: form.bestSeason,
        highlights: form.highlights.filter(h => h.trim()),
        isFeatured: form.isFeatured,
      };

      const url = editSlug ? `/api/destinations/${editSlug}` : "/api/destinations";
      const method = editSlug ? "PATCH" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const j = await r.json() as { success: boolean; message?: string; errors?: Record<string, string[]> };
      if (!j.success) {
        if (j.errors) {
          const msgs = Object.entries(j.errors)
            .map(([f, e]) => `${f}: ${(e as string[]).join(", ")}`)
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
    if (!confirm("Delete this destination? It will be hidden from the public.")) return;
    setDeleting(slug);
    await fetch(`/api/destinations/${slug}`, { method: "DELETE", credentials: "include" });
    setDestinations(prev => prev.filter(d => d.slug !== slug));
    setDeleting(null);
  }

  async function toggleFeatured(d: Destination) {
    await fetch(`/api/destinations/${d.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isFeatured: !d.isFeatured }),
    });
    setDestinations(prev => prev.map(x => x.slug === d.slug ? { ...x, isFeatured: !x.isFeatured } : x));
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="mt-0.5 text-sm text-gray-500">{destinations.length} destinations</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Add01Icon size={16} /> Add Destination
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-16 text-center shadow-sm">
          <MapPinIcon size={48} className="mb-3 text-gray-300" />
          <p className="text-gray-400">No destinations yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map(d => (
            <div key={d._id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="relative h-40 bg-gradient-to-br from-blue-100 to-indigo-200">
                {d.coverImage ? (
                  <Image src={d.coverImage} alt={d.name} fill className="object-cover" sizes="33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <MapPinIcon size={40} className="text-blue-300" />
                  </div>
                )}
                {d.isFeatured && (
                  <span className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white shadow">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{d.name}</h3>
                    <p className="text-xs text-gray-400">{d.location.city}, {d.location.country}</p>
                    {d.averageRating > 0 && (
                      <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <FaStar size={10} className="text-amber-400" /> {d.averageRating.toFixed(1)} ({d.totalReviews})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      onClick={() => toggleFeatured(d)}
                      title={d.isFeatured ? "Unfeature" : "Feature"}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                        d.isFeatured
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {d.isFeatured ? "★" : "☆"}
                    </button>
                    <button
                      onClick={() => openEdit(d)}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <PencilEdit01Icon size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(d.slug)}
                      disabled={deleting === d.slug}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
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
          {/* backdrop */}
          <div className="flex-1 bg-black/40" onClick={close} />
          {/* panel */}
          <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            {/* drawer header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editSlug ? "Edit Destination" : "Add Destination"}
              </h2>
              <button onClick={close} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <Cancel01Icon size={18} />
              </button>
            </div>

            {/* drawer body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin-light">
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              {/* Name */}
              <Field label="Destination Name *">
                <input
                  value={form.name}
                  onChange={e => setField("name", e.target.value)}
                  placeholder="e.g. Annapurna Base Camp"
                  className={input}
                />
              </Field>

              {/* Short description */}
              <Field label="Short Description">
                <input
                  value={form.shortDescription}
                  onChange={e => setField("shortDescription", e.target.value)}
                  placeholder="One-liner summary (shown in cards)"
                  className={input}
                />
              </Field>

              {/* Description */}
              <Field label="Full Description *">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setField("description", e.target.value)}
                  placeholder="Detailed description of the destination…"
                  className={input}
                />
              </Field>

              {/* Cover image */}
              <ImageUpload
                value={form.coverImage}
                onChange={(url) => setField("coverImage", url)}
                folder="destinations"
                label="Cover Image"
                aspectRatio="aspect-video"
              />

              {/* Location */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Location *</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City">
                    <input value={form.location.city} onChange={e => setLocation("city", e.target.value)} placeholder="Pokhara" className={input} />
                  </Field>
                  <Field label="Country">
                    <input value={form.location.country} onChange={e => setLocation("country", e.target.value)} placeholder="Nepal" className={input} />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Address (optional)">
                    <input value={form.location.address} onChange={e => setLocation("address", e.target.value)} placeholder="Street / area" className={input} />
                  </Field>
                </div>
              </div>

              {/* Best Season */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Best Season</p>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSeason(s)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        form.bestSeason.includes(s)
                          ? "bg-blue-700 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Highlights</p>
                <div className="space-y-2">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={h}
                        onChange={e => setHighlight(i, e.target.value)}
                        placeholder={`Highlight ${i + 1}`}
                        className={`${input} flex-1`}
                      />
                      {form.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHighlight(i)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Cancel01Icon size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addHighlight}
                  className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <Add01Icon size={14} /> Add highlight
                </button>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Mark as Featured</p>
                  <p className="text-xs text-gray-500">Featured destinations appear on the homepage</p>
                </div>
                <button
                  type="button"
                  onClick={() => setField("isFeatured", !form.isFeatured)}
                  className={`relative h-6 w-11 rounded-full transition ${form.isFeatured ? "bg-blue-700" : "bg-gray-200"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.isFeatured ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* drawer footer */}
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

// ── helpers ────────────────────────────────────────────────────────────────
const input =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
