import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white mt-10">
      <div className="max-w-6xl mx-auto px-8 py-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

        {/* Logo + tagline */}
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Nepal.png"
              alt="nepaltravels logo"
              width={40}
              height={40}
              className="rounded-xl object-contain"
            />
            <span className="text-xl font-bold text-white">nepaltravels</span>
          </Link>
          <p className="text-gray-400 mt-3 text-sm">
            © {new Date().getFullYear()} nepaltravels Tours & Travels.
            <br />All rights reserved.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-300">
          <Link href="/destinations" className="hover:text-white transition">Destinations</Link>
          <Link href="/packages" className="hover:text-white transition">Packages</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="#" className="hover:text-white transition">Contact</Link>
          <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
        </div>

      </div>
    </footer>
  );
}
