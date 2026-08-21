import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Smart Tourism",
  description: "Set a new password for your account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl bg-white p-8 shadow-lg text-center text-gray-400">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
