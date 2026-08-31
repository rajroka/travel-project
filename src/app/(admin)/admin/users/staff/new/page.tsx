"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserAccountIcon } from "hugeicons-react";

export default function NewStaffPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.password) { setError("First name, email, and password are required."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const json = await res.json() as { success: boolean; message: string };
    setLoading(false);
    if (json.success) router.push("/admin/users/staff");
    else setError(json.message);
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Staff Member</h1>
        <p className="mt-1 text-sm text-gray-500">Create a new staff account</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {error && <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(["firstName","lastName"] as const).map(field => (
              <div key={field}>
                <label className="mb-1.5 block text-sm font-medium capitalize text-gray-700">{field.replace("N"," N")}</label>
                <input name={field} value={form[field]} onChange={handleChange} required={field === "firstName"}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
            ))}
          </div>
          {(["email","phone","password"] as const).map(field => (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-medium capitalize text-gray-700">
                {field}{field === "phone" ? " (optional)" : ""}
              </label>
              <input
                name={field} value={form[field]} onChange={handleChange}
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                required={field !== "phone"}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition">
            <UserAccountIcon size={16} />
            {loading ? "Creating…" : "Create Staff Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
