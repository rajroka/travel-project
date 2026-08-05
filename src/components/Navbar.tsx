import { FaBell, FaGlobe } from "react-icons/fa";

export default function Navbar() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="text-2xl font-bold text-black">AI Trip Planner</h1>
            <p className="text-sm text-gray-500">nepaltravels</p>
          </div>
        </div>

        <nav className="flex gap-10">
          <a className="text-gray-700">Destinations</a>
          <a className="text-gray-700">Packages</a>
          <a className="text-blue-600 font-semibold border-b-2 border-blue-600">
            AI Planner
          </a>
          <a className="text-gray-700">My Bookings</a>
        </nav>

        <div className="flex items-center gap-5 text-gray-700">
          <FaBell />
          <FaGlobe />
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </header>
  );
}