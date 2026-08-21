"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { SquareLockPasswordIcon, ViewIcon, ViewOffIcon, CheckmarkCircle01Icon } from "hugeicons-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token. Please request a new link.");
  }, [token]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) { setError("Invalid reset token."); return; }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await authClient.resetPassword({
      newPassword: form.password,
      token,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Failed to reset password. The link may have expired.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckmarkCircle01Icon size={18} className="text-3xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Password reset!</h2>
        <p className="mt-2 text-gray-500">
          Your password has been updated. Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <SquareLockPasswordIcon size={18} className="text-2xl text-blue-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose a strong password for your account.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
          {!token && (
            <span>
              {" "}
              <Link href="/forgot-password" className="underline font-medium">
                Request a new one
              </Link>.
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            New password
          </label>
          <div className="relative">
            <SquareLockPasswordIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              required
              disabled={!token}
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <ViewOffIcon size={18} /> : <ViewIcon size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirm new password
          </label>
          <div className="relative">
            <SquareLockPasswordIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={!token}
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <ViewOffIcon size={18} /> : <ViewIcon size={18} />}
            </button>
          </div>
        </div>

        {/* Password strength hint */}
        {form.password && (
          <ul className="grid grid-cols-2 gap-1 text-xs">
            {[
              { label: "8+ characters", ok: form.password.length >= 8 },
              { label: "1 uppercase", ok: /[A-Z]/.test(form.password) },
              { label: "1 number", ok: /[0-9]/.test(form.password) },
              { label: "Passwords match", ok: form.password === form.confirmPassword && form.confirmPassword !== "" },
            ].map(({ label, ok }) => (
              <li key={label} className={`flex items-center gap-1 ${ok ? "text-green-600" : "text-gray-400"}`}>
                <span>{ok ? "✓" : "○"}</span> {label}
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={loading || !token}
          className="mt-2 w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Updating password…" : "Reset password"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
