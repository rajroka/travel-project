import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import Footer from "@/components/Footer";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import PopularPackages from "@/components/home/PopularPackages";
import AIPlanner from "@/components/home/AIPlanner";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <Hero />
      <FeaturedDestinations />
      <AIPlanner />
      <PopularPackages />
      

      <Footer />
    </main>
  );
}