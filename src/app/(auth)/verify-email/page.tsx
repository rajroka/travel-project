import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Smart Tourism",
  description: "Verify your Smart Tourism email address",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl bg-white p-8 shadow-lg text-center text-gray-400">Loading…</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
