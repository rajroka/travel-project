import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Smart Tourism",
  description: "Reset your Smart Tourism account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
