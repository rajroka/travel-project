import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/destinations/Hero";
import SearchBar from "@/components/destinations/SearchBar";
import Categories from "@/components/destinations/Categories";
import NepalMap from "@/components/destinations/NepalMap";
import WhyVisitNepal from "@/components/destinations/WhyVisitNepal";

export default function DestinationsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <Hero />
      <SearchBar />
      <Categories />
      <NepalMap />
      <WhyVisitNepal />

      <Footer />
    </main>
  );
}