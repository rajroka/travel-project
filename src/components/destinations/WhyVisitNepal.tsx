import {
  FaMountain,
  FaLandmark,
  FaPaw,
  FaHiking,
} from "react-icons/fa";

const reasons = [
  {
    icon: <FaMountain />,
    title: "Himalayas",
    description:
      "Experience some of the world's highest mountains and breathtaking Himalayan landscapes.",
  },
  {
    icon: <FaLandmark />,
    title: "Culture & Heritage",
    description:
      "Discover ancient temples, historic cities, festivals and unique traditions.",
  },
  {
    icon: <FaPaw />,
    title: "Wildlife",
    description:
      "Explore Nepal's national parks and encounter rhinos, elephants, tigers and more.",
  },
  {
    icon: <FaHiking />,
    title: "Adventure",
    description:
      "Enjoy trekking, rafting, paragliding, mountain flights and unforgettable adventures.",
  },
];

export default function WhyVisitNepal() {
  return (
    <section className="bg-[#F8FAFC] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Why Nepal?
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            There is something for everyone
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Whether you love nature, culture or adventure, Nepal has an
            experience waiting for you.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-2xl border border-gray-200 bg-white p-7 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-700">
                {reason.icon}
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {reason.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}