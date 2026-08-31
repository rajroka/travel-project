import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/Navbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto scrollbar-thin-light">
          {children}
        </main>
      </div>
    </div>
  );
}
