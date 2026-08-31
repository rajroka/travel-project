"use client";

import { useState } from "react";
import { Notification01Icon } from "hugeicons-react";

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ title: "", message: "", type: "general", userIds: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.message) { setError("Title and message are required."); return; }
    setSending(true); setError(""); setSent(false);
    const body: Record<string, unknown> = { title: form.title, message: form.message, type: form.type };
    if (form.userIds.trim()) body.userIds = form.userIds.split(",").map(s => s.trim()).filter(Boolean);
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const json = await res.json() as { success: boolean; message: string };
    setSending(false);
    if (json.success) { setSent(true); setForm({ title: "", message: "", type: "general", userIds: "" }); }
    else setError(json.message);
  }

  const TYPES = ["general", "new_package", "promotion", "booking_confirmed", "booking_cancelled", "trip_reminder"];

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
        <p className="mt-1 text-sm text-gray-500">Broadcast a message to all users or specific users</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {sent && (
          <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
            ✓ Notification sent successfully.
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Notification title"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Notification message…" rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Target User IDs <span className="font-normal text-gray-400">(optional — comma separated; leave blank to send to all)</span>
            </label>
            <input value={form.userIds} onChange={e => setForm(p => ({ ...p, userIds: e.target.value }))}
              placeholder="userId1, userId2, …"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>

          <button type="submit" disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition">
            <Notification01Icon size={16} />
            {sending ? "Sending…" : form.userIds ? "Send to Selected Users" : "Broadcast to All Users"}
          </button>
        </form>
      </div>
    </div>
  );
}
