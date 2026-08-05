 import Image from "next/image";
 export default function FoodSection() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🍴 Gastronomic Suggestions
      </h2>

      <div className="grid grid-cols-2 gap-6">

        {/* Card 1 */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
         <Image
  src="/images/Restaurant2.jpg"
  alt="Kichi Kichi Omurice"
  width={400}
  height={250}
  className="w-full h-44 object-cover"
/>

          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-900">
              Kichi Kichi Omurice
            </h3>

            <p className="text-gray-600 mt-2">
              Traditional Japanese dining experience.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <Image
  src="/images/restaurant1.jpg"
  alt="Restaurant"
  width={400}
  height={250}
  className="w-full h-44 object-cover"
/>  

          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-900">
              Moriya Izakaya
            </h3>

            <p className="text-gray-600 mt-2">
              Authentic Japanese Izakaya with locals.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}