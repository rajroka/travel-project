import { FaClock, FaStar } from "react-icons/fa";

const packages = [
  {
    title: "Everest Base Camp Trek",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    duration: "14 Days",
    price: "$1499",
    rating: "5.0",
  },
  {
    title: "Pokhara Adventure",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
    duration: "5 Days",
    price: "$499",
    rating: "4.9",
  },
  {
    title: "Chitwan Jungle Safari",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    duration: "3 Days",
    price: "$299",
    rating: "4.8",
  },
];

export default function PopularPackages() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Popular Tour Packages
          </h2>

          <p className="mt-3 text-gray-600">
            Choose from our most loved travel experiences.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {packages.map((pkg) => (
            <div
              key={pkg.title}
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                src={pkg.image}
                alt={pkg.title}
                className="h-60 w-full object-cover"
              />

              <div className="p-6">

                <div className="flex items-center justify-between">

                  <h3 className="text-xl font-bold">
                    {pkg.title}
                  </h3>

                  <div className="flex items-center gap-1 text-yellow-500">
                    <FaStar />
                    {pkg.rating}
                  </div>

                </div>

                <div className="mt-4 flex items-center gap-2 text-gray-500">
                  <FaClock />
                  {pkg.duration}
                </div>

                <div className="mt-6 flex items-center justify-between">

                  <span className="text-2xl font-bold text-blue-700">
                    {pkg.price}
                  </span>

                  <button className="rounded-lg bg-blue-700 px-5 py-2 text-white transition hover:bg-blue-800">
                    Book Now
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}