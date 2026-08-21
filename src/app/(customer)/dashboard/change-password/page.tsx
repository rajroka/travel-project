import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password | Smart Tourism",
};

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-lg py-8">
      <ChangePasswordForm />
    </div>
  );
}
