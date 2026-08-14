import Link from "next/link";
import { FaBell, FaGlobe } from "react-icons/fa";

export default function Navbar() {
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
            href="/bookings"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            My Bookings
          </Link>

          
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-5 text-gray-700">
          <button
            aria-label="Notifications"
            className="hover:text-blue-600 transition"
          >
            <FaBell />
          </button>

          <button
            aria-label="Language"
            className="hover:text-blue-600 transition"
          >
            <FaGlobe />
          </button>

          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>

      </div>
    </header>
  );
}