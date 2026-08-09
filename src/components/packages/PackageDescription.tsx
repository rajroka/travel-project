export default function PackageDescription() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900">
        Experience the Gateway to the Annapurnas
      </h2>

      <p className="mt-4 text-sm leading-7 text-gray-600">
        Embark on a curated 4-day journey through Pokhara, Nepal's most
        scenic valley. This adventure blends adrenaline-pumping activities
        with moments of profound serenity. From sunrise at Sarangkot to
        peaceful boat rides on Phewa Lake, every moment is designed by our
        local experts to provide a seamless, premium experience.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-4 border-y border-gray-200 py-6 sm:grid-cols-4">
        <Feature icon="🏨" text="4-Star Stay" />
        <Feature icon="🚗" text="Private Transport" />
        <Feature icon="📍" text="Local Guide" />
        <Feature icon="🍽️" text="Daily Breakfast" />
      </div>
    </section>
  );
}

function Feature({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium text-gray-700">
        {text}
      </span>
    </div>
  );
}