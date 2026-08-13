import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import Itinerary from "@/components/Itinerary";
import RightSidebar from "@/components/Rightsidebar";
import FoodSection from "@/components/FoodSection";
import Footer from "@/components/Footer";
import MapCard from "@/components/MapCard";

export default function AIPlanner() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-8 px-8 py-8">
        <Sidebar />

        <div className="flex-1 space-y-6">
          <Hero />
          <Itinerary />
          <FoodSection />
        </div>

        <div className="w-[320px] space-y-6">
          <RightSidebar />
          <MapCard />
        </div>
      </div>

      <Footer />
    </main>
  );
}