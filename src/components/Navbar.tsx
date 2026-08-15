"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FaBell,
  FaGlobe,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
            NT
          </div>

          <div>
            <h1 className="text-xl font-bold text-black">
              nepaltravels
            </h1>

            <p className="text-xs text-gray-500">
              Explore. Travel. Discover.
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link
            href="/destinations"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Destinations
          </Link>

          <Link
            href="/packages"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Packages
          </Link>

          <Link
            href="/ai-planner"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            AI Planner
          </Link>

          <Link
            href="/booking"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            My Bookings
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-5 text-gray-700">

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="hover:text-blue-600 transition"
          >
            <FaBell />
          </button>

          {/* Language */}
          <button
            aria-label="Language"
            className="hover:text-blue-600 transition"
          >
            <FaGlobe />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Profile menu"
              className="w-10 h-10 rounded-full bg-gray-300 hover:ring-2 hover:ring-blue-600 transition"
            />

            {profileOpen && (
              <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">

                {/* User information */}
                <div className="px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center">
                      <FaUser />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        Aaditya Thapa
                      </p>

                      <p className="text-xs text-gray-500">
                        aaditya@email.com
                      </p>
                    </div>

                  </div>
                </div>

                {/* Menu */}
                <div className="py-2">

                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <FaUser className="text-sm" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/booking"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <FaBell className="text-sm" />
                    <span>My Bookings</span>
                  </Link>

                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 py-2">
                  <button
                    className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 transition"
                    onClick={() => {
                      setProfileOpen(false);
                      // Logout logic will be added later
                    }}
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span>Logout</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}