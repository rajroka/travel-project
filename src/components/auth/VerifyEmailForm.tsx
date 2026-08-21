"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { Mail01Icon, CheckmarkCircle01Icon, CancelCircleIcon } from "hugeicons-react";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Auto-verify when token is present in URL
  useEffect(() => {
    if (!token) return;

    async function verify() {
      setStatus("verifying");
      try {
        // Better Auth handles GET /api/auth/verify-email?token=... automatically
        // We hit the endpoint directly
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json().catch(() => ({})) as { message?: string };
          setErrorMessage(data.message ?? "Verification failed. The link may have expired.");
          setStatus("error");
        }
      } catch {
        setErrorMessage("Something went wrong. Please try again.");
        setStatus("error");
      }
    }

    verify();
  }, [token]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    const result = await authClient.sendVerificationEmail({
      email: resendEmail,
      callbackURL: "/verify-email",
    });
    setResendLoading(false);

    if (!result.error) setResendSent(true);
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckmarkCircle01Icon size={18} className="text-3xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Email verified!</h2>
        <p className="mt-2 text-gray-500">Your account is now active. You can sign in.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ── Verifying state ────────────────────────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
        <h2 className="text-xl font-bold text-gray-900">Verifying your email…</h2>
        <p className="mt-2 text-gray-500">Please wait a moment.</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <CancelCircleIcon size={18} className="text-3xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verification failed</h2>
          <p className="mt-2 text-gray-500">{errorMessage}</p>
        </div>

        {/* Resend */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="mb-4 text-center text-sm text-gray-500">
            Request a new verification email:
          </p>
          {resendSent ? (
            <p className="text-center text-sm text-green-600">
              ✓ New verification email sent. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleResend} className="flex gap-2">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={resendLoading}
                className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
              >
                {resendLoading ? "…" : "Resend"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Idle state (no token in URL — allow manual resend) ─────────────────────
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <Mail01Icon size={18} className="text-2xl text-blue-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-500">
          Check your inbox for a verification link. If you didn&apos;t receive one,
          enter your email below to resend.
        </p>
      </div>

      {resendSent ? (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-700 border border-green-200">
          ✓ Verification email sent. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleResend} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="relative">
              <Mail01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={resendLoading}
            className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {resendLoading ? "Sending…" : "Resend verification email"}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
