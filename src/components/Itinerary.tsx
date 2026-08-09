export default function Itinerary() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        📅 Daily Itinerary
      </h2>

      {/* Step 1 */}

      <div className="flex gap-4 mb-8">

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            1
          </div>

          <div className="w-[2px] flex-1 bg-gray-300 mt-2"></div>
        </div>

        <div>

          <h3 className="text-xl font-semibold">
            Arrival & Gion District
          </h3>

          <p className="text-gray-600 mt-2">
            Check into your Ryokan in the Higashiyama district.
            Take a twilight stroll through the historic Gion
            streets to spot Geisha heading to appointments.
          </p>

          <div className="flex gap-2 mt-3">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
              Culture
            </span>

            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
              Photography
            </span>
          </div>

        </div>

      </div>

      {/* Step 2 */}

      <div className="flex gap-4">

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          2
        </div>

        <div>

          <h3 className="text-xl font-semibold">
            The Golden Pavilion
          </h3>

          <p className="text-gray-600 mt-2">
            Early morning visit to Kinkaku-ji before the crowds.
            Continue to Ryoan-ji for a meditation session in the
            famous Zen rock garden.
          </p>

          <div className="mt-4 bg-blue-50 rounded-xl p-4 text-blue-700">
            💡 Tip: Visit at 6–8 AM for the best photos.
          </div>

        </div>

      </div>

    </section>
  );
}   