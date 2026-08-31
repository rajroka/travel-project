import Link from "next/link";
import { ArrowRight01Icon } from "hugeicons-react";

export default function HomepagePage() {
  const sections = [
    { label: "Featured Destinations", desc: "Destinations marked as featured appear in the homepage carousel. Go to Destinations to set the featured flag.", href: "/admin/destinations" },
    { label: "Popular Packages", desc: "The homepage auto-shows the most booked packages. Manage packages to activate/deactivate them.", href: "/admin/packages" },
    { label: "Gallery Banners", desc: "Upload images with category 'banner' via the Upload API to display them in the homepage banner slider.", href: "/admin/content/gallery" },
    { label: "Contact Info", desc: "Update the company email, phone, address, and social links shown in the footer.", href: "/admin/content/contact" },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage</h1>
        <p className="mt-1 text-sm text-gray-500">Manage what appears on the public homepage</p>
      </div>

      <div className="space-y-4">
        {sections.map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">{s.label}</h3>
            <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
            <Link href={s.href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
              Manage <ArrowRight01Icon size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
