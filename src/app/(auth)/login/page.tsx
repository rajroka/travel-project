import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Smart Tourism",
  description: "Sign in to your Smart Tourism account",
};

export default function LoginPage() {
  return <LoginForm />;
}
