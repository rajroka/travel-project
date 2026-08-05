"use client";

import Link from "next/link";
import { FaBell, FaGlobe } from "react-icons/fa";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Destinations",
    href: "/destinations",
  },
  {
    label: "Packages",
    href: "/packages",
  },
  {
    label: "AI Planner",
    href: "/ai-planner",
  },
  {
    label: "My Bookings",
    href: "/bookings",
  },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-lg font-bold text-white shadow-md">
            NT
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Nepal Travels
            </h1>

            <p className="text-sm text-gray-500">
              Explore the Beauty of Nepal
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="border-b-2 border-transparent pb-1 text-[15px] font-medium text-gray-700 transition-all duration-200 hover:border-blue-600 hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          <button className="text-gray-600 transition hover:text-blue-600">
            <FaBell size={18} />
          </button>

          <button className="text-gray-600 transition hover:text-blue-600">
            <FaGlobe size={18} />
          </button>

          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
            alt="Profile"
            className="h-10 w-10 rounded-full border-2 border-gray-200 object-cover"
          />
        </div>
      </div>
    </header>
  );
}