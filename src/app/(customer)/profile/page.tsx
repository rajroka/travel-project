import Navbar from "@/components/Navbar";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPlane,
  FaHeart,
  FaLock,
  FaSignOutAlt,
} from "react-icons/fa";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#17191b] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold">
            My Profile
          </h1>

          <p className="mt-3 text-gray-400 text-lg">
            Manage your account and travel preferences
          </p>
        </div>

        {/* Profile Header Card */}
        <section className="bg-[#1d2022] border border-gray-700 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-blue-700 flex items-center justify-center text-4xl font-bold shrink-0">
              AT
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">
                Aaditya Thapa
              </h2>

              <p className="text-gray-400 mt-1">
                aaditya@email.com
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Travel enthusiast
              </p>
            </div>

            {/* Edit Button */}
            <button className="bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold transition">
              Edit Profile
            </button>
          </div>
        </section>

        {/* Personal Information */}
        <section className="mb-8">

          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Personal Information
            </h2>

            <p className="text-gray-500 mt-1">
              Your basic account information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Full Name */}
            <div className="bg-[#1d2022] border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FaUser className="text-blue-500" />
                <span className="text-gray-400 text-sm">
                  Full Name
                </span>
              </div>

              <p className="font-medium text-lg">
                Aaditya Thapa
              </p>
            </div>

            {/* Email */}
            <div className="bg-[#1d2022] border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FaEnvelope className="text-blue-500" />
                <span className="text-gray-400 text-sm">
                  Email
                </span>
              </div>

              <p className="font-medium text-lg">
                aaditya@email.com
              </p>
            </div>

            {/* Phone */}
            <div className="bg-[#1d2022] border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FaPhone className="text-blue-500" />
                <span className="text-gray-400 text-sm">
                  Phone
                </span>
              </div>

              <p className="font-medium text-lg">
                +977 98XXXXXXXX
              </p>
            </div>

            {/* Location */}
            <div className="bg-[#1d2022] border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FaMapMarkerAlt className="text-blue-500" />
                <span className="text-gray-400 text-sm">
                  Location
                </span>
              </div>

              <p className="font-medium text-lg">
                Kathmandu, Nepal
              </p>
            </div>

          </div>
        </section>

        {/* Travel Preferences */}
        <section className="bg-[#1d2022] border border-gray-700 rounded-2xl p-7 mb-8">

          <div className="flex items-center gap-3 mb-6">
            <FaPlane className="text-blue-500 text-xl" />

            <div>
              <h2 className="text-2xl font-bold">
                Travel Preferences
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Personalize your travel experience
              </p>
            </div>
          </div>

          {/* Favorite Destinations */}
          <div className="mb-7">
            <h3 className="text-sm text-gray-400 mb-3">
              Favorite Destinations
            </h3>

            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full bg-blue-700/20 border border-blue-600 text-blue-400">
                Pokhara
              </span>

              <span className="px-4 py-2 rounded-full bg-blue-700/20 border border-blue-600 text-blue-400">
                Mustang
              </span>

              <span className="px-4 py-2 rounded-full bg-blue-700/20 border border-blue-600 text-blue-400">
                Everest
              </span>

              <span className="px-4 py-2 rounded-full bg-blue-700/20 border border-blue-600 text-blue-400">
                Chitwan
              </span>
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <h3 className="text-sm text-gray-400 mb-3">
              Travel Style
            </h3>

            <div className="flex flex-wrap gap-3">

              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25282a] border border-gray-600">
                <FaPlane className="text-blue-500" />
                Adventure
              </span>

              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25282a] border border-gray-600">
                <FaHeart className="text-blue-500" />
                Nature
              </span>

              <span className="px-4 py-2 rounded-full bg-[#25282a] border border-gray-600">
                Culture
              </span>

            </div>
          </div>

        </section>

        {/* Account Settings */}
        <section className="mb-10">

          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Account
            </h2>

            <p className="text-gray-500 mt-1">
              Manage your account settings
            </p>
          </div>

          <div className="bg-[#1d2022] border border-gray-700 rounded-2xl overflow-hidden">

            {/* Change Password */}
            <button className="w-full flex items-center justify-between p-5 hover:bg-[#25282a] transition">
              <div className="flex items-center gap-4">
                <FaLock className="text-blue-500" />

                <div className="text-left">
                  <p className="font-medium">
                    Change Password
                  </p>

                  <p className="text-sm text-gray-500">
                    Update your account password
                  </p>
                </div>
              </div>

              <span className="text-gray-500 text-xl">
                →
              </span>
            </button>

            <div className="border-t border-gray-700" />

         

            {/* Logout */}
            <button className="w-full flex items-center gap-4 p-5 text-red-400 hover:bg-red-500/10 transition">
              <FaSignOutAlt />

              <span className="font-medium">
                Logout
              </span>
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}