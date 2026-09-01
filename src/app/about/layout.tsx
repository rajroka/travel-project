import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export default function AboutLayout({ children }: { children: ReactNode }) {
  return <><Navbar /><main className="min-h-screen bg-white">{children}</main><Footer /></>;
}
