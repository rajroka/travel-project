"use client";

import Link from "next/link";
import Image from "next/image";
import { FiFacebook, FiInstagram, FiYoutube, FiPhone, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/Nepal.png" alt="Adventure Treks Nepal" width={32} height={32} className="object-contain" />
              <div className="leading-none">
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-white">Adventure</p>
                <p className="text-[8px] uppercase tracking-widest text-gray-500">Treks · Nepal</p>
              </div>
            </Link>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              Crafting unforgettable trekking and tour experiences across Nepal since 1983.
            </p>
            <div className="mt-3 flex gap-2">
              {[FiFacebook, FiInstagram, FiYoutube].map((Icon, i) => (
                <a key={i} href="#"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-700 text-gray-500 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white">
                  <Icon size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Home",         href: "/" },
                { label: "Destinations", href: "/destinations" },
                { label: "Packages",     href: "/packages" },
                { label: "About Us",     href: "/about" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">Legal</h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy",     href: "/privacy" },
                { label: "General FAQs",       href: "/#faq" },
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">Contact</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <FiPhone size={11} className="text-blue-500 flex-shrink-0" />
                <a href="tel:+97798510653" className="hover:text-white transition">+977 98510 65354</a>
              </li>
              <li className="flex items-center gap-2">
                <FiMail size={11} className="text-blue-500 flex-shrink-0" />
                <a href="mailto:info@adventuretreksnep.com" className="hover:text-white transition">info@adventuretreksnep.com</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-3 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Adventure Treks Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
