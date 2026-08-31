import type { ReactNode } from "react";
import StaffSidebar from "@/components/staff/StaffSidebar";
import Navbar from "@/components/Navbar";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <StaffSidebar />
        <main className="flex-1 overflow-y-auto scrollbar-thin-light">
          {children}
        </main>
      </div>
    </div>
  );
}
