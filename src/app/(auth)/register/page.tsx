import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Smart Tourism",
  description: "Join Smart Tourism and start exploring Nepal",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
