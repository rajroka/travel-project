import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageHero from "@/components/packages/PackageHero";
import PackageGallery from "@/components/packages/PackageGallery";
import PackageDetails from "@/components/packages/PackageDetails";

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-[#F8F8FF]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <PackageHero />
        <PackageGallery />
        <PackageDetails />
      </div>

      <Footer />
    </main>
  );
}