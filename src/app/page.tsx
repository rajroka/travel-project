import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import AIPlanner from "@/components/home/AIPlanner";
import PopularPackages from "@/components/home/PopularPackages";
import Footer from "@/components/Footer";


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