"use client";

import { useEffect, useState } from "react";

interface ContactInfo {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  mapEmbedUrl?: string;
  businessHours?: string;
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; youtube?: string };
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactInfo>({
    companyName: "", email: "", phone: "", address: "", city: "", country: "",
    mapEmbedUrl: "", businessHours: "",
    socialLinks: { facebook: "", instagram: "", twitter: "", youtube: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content/contact")
      .then(r => r.json())
      .then(j => { if (j.success && j.data.contact) setForm({ ...form, ...j.data.contact }); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const key = name.replace("social_", "");
      setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, [key]: value } }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/content/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
  }

  const fields: Array<{ name: keyof ContactInfo | string; label: string; required?: boolean }> = [
    { name: "companyName", label: "Company Name", required: true },
    { name: "email", label: "Email", required: true },
    { name: "phone", label: "Phone", required: true },
    { name: "address", label: "Address", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true },
    { name: "mapEmbedUrl", label: "Google Maps Embed URL" },
    { name: "businessHours", label: "Business Hours (e.g. Mon–Fri 9am–6pm)" },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Information</h1>
        <p className="mt-1 text-sm text-gray-500">Update company contact details shown on the website</p>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {saved && <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">✓ Contact info saved.</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">{f.label}</label>
                <input
                  name={f.name}
                  value={(form as Record<string, unknown>)[f.name] as string ?? ""}
                  onChange={handleChange}
                  required={f.required}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}

            <p className="pt-2 text-sm font-semibold text-gray-700">Social Links</p>
            {(["facebook","instagram","twitter","youtube"] as const).map(s => (
              <div key={s}>
                <label className="mb-1.5 block text-sm capitalize font-medium text-gray-600">{s}</label>
                <input
                  name={`social_${s}`}
                  value={form.socialLinks?.[s] ?? ""}
                  onChange={handleChange}
                  placeholder={`https://${s}.com/yourpage`}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}

            <button type="submit" disabled={saving}
              className="rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
