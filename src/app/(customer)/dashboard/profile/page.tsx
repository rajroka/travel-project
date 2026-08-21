"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { UserIcon, Mail01Icon, SmartPhone01Icon, SquareLockPasswordIcon, FloppyDiskIcon } from "hugeicons-react";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body: Record<string, string> = {};
    if (form.firstName) body.firstName = form.firstName;
    if (form.lastName) body.lastName = form.lastName;
    if (form.phone) body.phone = form.phone;

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const nameParts = user?.name?.split(" ") ?? ["", ""];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Avatar */}
      <div className="mb-8 flex items-center gap-5">
        {user?.image ? (
          <img src={user.image} alt={user.name ?? ""} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-700 text-3xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
          <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {(["profile", "password"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium capitalize transition border-b-2 -mb-px ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "profile" ? "Profile Details" : "Change Password"}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          {saved && (
            <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 border border-green-200">
              ✓ Profile updated successfully.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">First name</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" name="firstName"
                  defaultValue={nameParts[0]}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Last name</label>
              <input
                type="text" name="lastName"
                defaultValue={nameParts.slice(1).join(" ")}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail01Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email" value={user?.email ?? ""}
                readOnly
                className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
            <div className="relative">
              <SmartPhone01Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel" name="phone"
                onChange={handleChange}
                placeholder="+977-9800000000"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition"
          >
            <FloppyDiskIcon size={16} /> {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      ) : (
        <ChangePasswordForm />
      )}
    </div>
  );
}
