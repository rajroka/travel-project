"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { Mail01Icon, ArrowLeft01Icon } from "hugeicons-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Email is required."); return; }

    setLoading(true);
    setError("");

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Mail01Icon size={18} className="text-3xl text-blue-700" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="mt-3 text-gray-500">
          We sent a password reset link to{" "}
          <span className="font-medium text-gray-800">{email}</span>.
          The link expires in 1 hour.
        </p>
        <p className="mt-4 text-sm text-gray-400">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            onClick={() => setSent(false)}
            className="text-blue-600 hover:underline"
          >
            try again
          </button>.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft01Icon size={18} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <Mail01Icon size={18} className="text-2xl text-blue-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="relative">
            <Mail01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft01Icon size={18} className="text-xs" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
