import Image from "next/image";

export default function MapCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm mt-6 hover:shadow-2xl transition-all duration-300">
      <Image
        src="/images/map.jpg"
        alt="Kyoto Map"
        width={500}
        height={300}
        className="w-full h-56 object-cover"
      />

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900">
          Kyoto Map View
        </h3>

        <p className="text-gray-500 text-sm mt-1">
          7 recommended hotspots
        </p>
      </div>
    </div>
  );
}