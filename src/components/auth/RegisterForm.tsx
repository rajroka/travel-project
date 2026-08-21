"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { FcGoogle } from "react-icons/fc";
import { ViewIcon, ViewOffIcon, Mail01Icon, SquareLockPasswordIcon, UserIcon, SmartPhone01Icon } from "hugeicons-react";

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function validate() {
    if (!form.firstName.trim() || !form.lastName.trim())
      return "First and last name are required.";
    if (form.firstName.trim().length < 2)
      return "First name must be at least 2 characters.";
    if (!form.email) return "Email is required.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(form.password))
      return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(form.password))
      return "Password must contain at least one number.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    const result = await authClient.signUp.email({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email,
      password: form.password,
      // Pass extra fields recognized by Better Auth additionalFields
      // @ts-expect-error — Better Auth passes additional fields through
      phone: form.phone || undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Registration failed. Please try again.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    setGoogleLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Account created!</h2>
        <p className="mt-2 text-gray-500">Redirecting you to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
        <p className="mt-2 text-gray-500">Start exploring Nepal today</p>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
      >
        <FcGoogle className="text-xl" />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-400">or register with email</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              First name
            </label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="John"
                required
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
              className="w-full rounded-xl border border-gray-200 py-3 px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="relative">
            <Mail01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <SmartPhone01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+977-9800000000"
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
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
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirm password
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
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      {/* Terms */}
      <p className="mt-4 text-center text-xs text-gray-400">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
      </p>

      {/* Login link */}
      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
