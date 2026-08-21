import { MapPinIcon, Search01Icon } from "hugeicons-react";

export default function Hero() {
  return (
    <section className="relative h-[520px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop')",
        }}
      />

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white">
            Explore Nepal
          </p>

          <h1 className="text-5xl font-extrabold leading-tight text-white md:text-6xl">
            Discover the beauty
            <br />
            of Nepal
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
            From the majestic Himalayas to ancient cities and peaceful
            national parks, discover unforgettable destinations across Nepal.
          </p>
        </div>

        <div className="mt-10 flex max-w-4xl items-center rounded-2xl bg-white p-3 shadow-2xl">
          <div className="flex flex-1 items-center gap-3 px-4">
            <MapPinIcon className="text-blue-700" size={20} />

            <div>
              <p className="text-xs text-gray-500">Destination</p>
              <p className="text-sm font-medium text-gray-800">
                Where do you want to go?
              </p>
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-blue-700 px-7 py-4 font-semibold text-white hover:bg-blue-800">
            <Search01Icon size={18} />
            Search
          </button>
        </div>
      </div>
    </section>
  );
}