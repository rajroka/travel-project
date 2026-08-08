import PackageDescription from "./PackageDescription";
import Itinerary from "./Itinerary";
import BookingCard from "./BookingCard";
import Reviews from "./Reviews";

export default function PackageDetails() {
  return (
    <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <PackageDescription />

        <Itinerary />

        <Reviews />
      </div>

      <BookingCard />
    </section>
  );
}