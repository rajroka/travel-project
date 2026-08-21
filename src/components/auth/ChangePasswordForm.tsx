"use client";

import { useState } from "react";
import { SquareLockPasswordIcon, ViewIcon, ViewOffIcon, CheckmarkCircle01Icon } from "hugeicons-react";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess(false);
  }

  function validate() {
    if (!form.currentPassword) return "Current password is required.";
    if (!form.newPassword) return "New password is required.";
    if (form.newPassword.length < 8) return "New password must be at least 8 characters.";
    if (!/[A-Z]/.test(form.newPassword)) return "New password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(form.newPassword)) return "New password must contain at least one number.";
    if (form.newPassword !== form.confirmPassword) return "Passwords do not match.";
    if (form.currentPassword === form.newPassword) return "New password must be different from current password.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
        credentials: "include",
      });

      const data = await res.json() as { success: boolean; message: string };

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to change password.");
        return;
      }

      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const fields: Array<{
    key: "current" | "new" | "confirm";
    name: keyof typeof form;
    label: string;
    placeholder: string;
    autoComplete: string;
  }> = [
    { key: "current", name: "currentPassword", label: "Current password", placeholder: "••••••••", autoComplete: "current-password" },
    { key: "new", name: "newPassword", label: "New password", placeholder: "Min. 8 chars, 1 uppercase, 1 number", autoComplete: "new-password" },
    { key: "confirm", name: "confirmPassword", label: "Confirm new password", placeholder: "••••••••", autoComplete: "new-password" },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Change Password</h2>

      {/* Success */}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          <CheckmarkCircle01Icon size={18} />
          Password updated successfully.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, name, label, placeholder, autoComplete }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {label}
            </label>
            <div className="relative">
              <SquareLockPasswordIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={show[key] ? "text" : "password"}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShow((p) => ({ ...p, [key]: !p[key] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show[key] ? <ViewOffIcon size={18} /> : <ViewIcon size={18} />}
              </button>
            </div>
          </div>
        ))}

        {/* Strength hints */}
        {form.newPassword && (
          <ul className="grid grid-cols-2 gap-1 text-xs">
            {[
              { label: "8+ characters", ok: form.newPassword.length >= 8 },
              { label: "1 uppercase", ok: /[A-Z]/.test(form.newPassword) },
              { label: "1 number", ok: /[0-9]/.test(form.newPassword) },
              { label: "Passwords match", ok: form.newPassword === form.confirmPassword && form.confirmPassword !== "" },
            ].map(({ label, ok }) => (
              <li key={label} className={`flex items-center gap-1 ${ok ? "text-green-600" : "text-gray-400"}`}>
                <span>{ok ? "✓" : "○"}</span> {label}
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
