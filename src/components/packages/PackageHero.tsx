import { FaStar, FaMapMarkerAlt } from "react-icons/fa";

export default function PackageHero() {
  return (
    <section className="mb-5">
      {/* Location */}
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-800">
        <FaMapMarkerAlt size={11} />
        <span>Nepal, Himalayas</span>
      </div>

      {/* Package title */}
      <h1 className="mt-2 text-xl font-semibold text-gray-900">
        4-Day Adventure in Pokhara
      </h1>

      {/* Rating and duration */}
      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <FaStar className="text-orange-500" size={15} />
          <span className="font-medium text-gray-900">4.9</span>
          <span>(128 Reviews)</span>
        </div>

        <span className="text-gray-300">•</span>

        <span>4 Days, 3 Nights</span>
      </div>
    </section>
  );
}