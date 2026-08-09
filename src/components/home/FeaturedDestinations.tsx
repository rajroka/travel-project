import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

const destinations = [
  {
    name: "Pokhara",
    image:
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80",
    description: "The city of lakes with breathtaking mountain views.",
    rating: 4.9,
  },
  {
    name: "Everest Base Camp",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    description: "Experience the world's highest mountain.",
    rating: 5.0,
  },
  {
    name: "Chitwan National Park",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    description: "Jungle safari and one-horned rhinoceros.",
    rating: 4.8,
  },
  {
    name: "Lumbini",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
    description: "Birthplace of Lord Buddha.",
    rating: 4.7,
  },
];

export default function FeaturedDestinations() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Featured Destinations
          </h2>

          <p className="mt-4 text-gray-600">
            Discover Nepal's most loved travel destinations.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {destinations.map((place) => (
            <div
              key={place.name}
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                src={place.image}
                alt={place.name}
                className="h-64 w-full object-cover"
              />

              <div className="p-6">

                <div className="mb-2 flex items-center justify-between">

                  <h3 className="text-xl font-bold">
                    {place.name}
                  </h3>

                  <div className="flex items-center gap-1 text-yellow-500">
                    <FaStar />
                    <span>{place.rating}</span>
                  </div>

                </div>

                <div className="mb-5 flex items-center gap-2 text-gray-500">
                  <FaMapMarkerAlt />
                  Nepal
                </div>

                <p className="text-gray-600">
                  {place.description}
                </p>

                <button className="mt-6 w-full rounded-lg bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800">
                  Explore
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}