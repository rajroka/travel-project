import { MapsIcon } from "hugeicons-react";

export default function NepalMap() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Explore Nepal</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-gray-900">
            Discover Nepal<br />region by region
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-gray-600">
            Nepal is home to diverse landscapes, cultures and experiences.
            Explore the Himalayas, hills and Terai and find the destination
            that matches your travel style.
          </p>
          <button className="mt-7 flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800">
            <MapsIcon size={18} />
            Explore the map
          </button>
        </div>

        <div className="flex min-h-[380px] items-center justify-center rounded-3xl bg-blue-50">
          <div className="text-center">
            <MapsIcon size={72} className="mx-auto text-blue-700" />
            <h3 className="mt-6 text-2xl font-bold text-gray-900">Nepal</h3>
            <p className="mt-2 text-gray-500">Mountains • Hills • Terai</p>
          </div>
        </div>
      </div>
    </section>
  );
}
