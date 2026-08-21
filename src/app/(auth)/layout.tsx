import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Top nav bar */}
      <nav className="px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl">🇳🇵</span>
          <span className="text-xl font-bold text-blue-700">Smart Tourism</span>
        </Link>
      </nav>

      {/* Centered card */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
