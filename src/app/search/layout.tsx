import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export default function SearchLayout({ children }: { children: ReactNode }) {
  return <><Navbar /><main className="min-h-screen bg-gray-50">{children}</main><Footer /></>;
}
