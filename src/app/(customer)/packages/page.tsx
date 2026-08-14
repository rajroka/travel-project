import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";   

const galleryImages = [
  "/images/map.jpg",
  "/images/restaurant1.jpg",
  "/images/restaurant2.jpg",
  "/images/premium_photo-1661953124283-76d0a8436b87.avif",
];

const sections = [
  {
    number: "1",
    title: "Arrival & Travel Support",
    description:
      "Airport pickup, welcome assistance and comfortable transfer to your hotel.",
  },
  {
    number: "2",
    title: "Service & Adventure",
    description:
      "Explore the highlights of Nepal with guided experiences and local activities.",
  },
  {
    number: "3",
    title: "Selected Package",
    description:
      "Your selected accommodation, transportation and planned activities are included.",
  },
  {
    number: "4",
    title: "Farewell Package",
    description:
      "Enjoy a smooth final transfer and assistance before your departure.",
  },
];

const reviews = [
  {
    name: "Marcus Singh",
    avatar: "M",
    text: "The whole experience was incredibly well organized. The scenery and service were amazing.",
  },
  {
    name: "Elena Lopez",
    avatar: "E",
    text: "Beautiful destination, great hotel and a very smooth booking experience.",
  },
];

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <Navbar />

      {/* NAVBAR */}
     

      <div className="mx-auto max-w-[1280px] px-6 py-7">

        {/* BREADCRUMB */}
        <div className="mb-5 flex items-center gap-2 text-sm text-[#8a94a6]">
          <span>NEPAL</span>
          <span>/</span>
          <span>HIMALAYAS</span>
          <span>/</span>
          <span className="text-[#4d596b]">EVEREST EXPERIENCE</span>
        </div>

        {/* TITLE */}
        <div className="mb-6">
          <div className="mb-2 text-[14px] font-bold uppercase tracking-wide text-[#f28a19]">
            7 DAY EXPLORE NEPAL
          </div>

          <h1 className="text-4xl font-bold leading-tight text-[#172033]">
            Himalayan Heritage: Nepal
          </h1>

          <div className="mt-2 flex items-center gap-4 text-sm text-[#7c8798]">
            <span className="text-[#f28a19]">★ 4.9</span>
            <span>12 Reviews</span>
            <span>7 Days</span>
            <span>6 Nights</span>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="grid gap-7 lg:grid-cols-[1fr_310px]">

          {/* LEFT */}
          <div>

            {/* IMAGE GALLERY */}
            <div className="grid h-[330px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">

              <div className="col-span-2 row-span-2 overflow-hidden rounded-xl bg-[#e8edf3]">
                <img
                  src={galleryImages[0]}
                  alt="Nepal destination"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="overflow-hidden rounded-xl bg-[#e8edf3]">
                <img
                  src={galleryImages[1]}
                  alt="Nepal experience"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="overflow-hidden rounded-xl bg-[#e8edf3]">
                <img
                  src={galleryImages[2]}
                  alt="Nepal experience"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="overflow-hidden rounded-xl bg-[#e8edf3]">
                <img
                  src={galleryImages[3]}
                  alt="Hotel"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="relative overflow-hidden rounded-xl bg-[#e8edf3]">
                <img
                  src={galleryImages[1]}
                  alt="Nepal"
                  className="h-full w-full object-cover"
                />

                <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[9px] text-white">
                  +8 photos
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <section className="mt-7">
              <h2 className="text-2xl font-bold text-[#172033]">
                Experience the Gateway to the Himalayas
              </h2>

              <p className="mt-3 max-w-[850px] text-base leading-6 text-[#727d8e]">
                Discover the beauty, culture and adventure of Nepal with a
                carefully planned journey through some of the country's most
                memorable destinations. From incredible mountain views to
                peaceful temples and authentic local experiences, this package
                gives you a complete Nepal adventure.
              </p>

              <div className="mt-5 grid grid-cols-2 border-y border-[#e4e9ef] py-4 md:grid-cols-4">

                <InfoItem icon="▣" text="7 Days" />
                <InfoItem icon="⌂" text="Hotel Included" />
                <InfoItem icon="⌖" text="Local Guide" />
                <InfoItem icon="✦" text="Daily Breakfast" />

              </div>
            </section>

            {/* BEFORE BOOK */}
            <section className="mt-8">
              <h2 className="mb-4 text-[18px] font-bold text-[#172033]">
                Before You Book
              </h2>

              <div className="overflow-hidden rounded-xl border border-[#e2e8ef] bg-white">

                {sections.map((section) => (
                  <div
                    key={section.number}
                    className="border-b border-[#edf0f4] px-5 py-4 last:border-b-0"
                  >
                    <div className="flex gap-4">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2f4f7] text-[10px] font-bold text-[#647084]">
                        {section.number}
                      </div>

                      <div className="flex-1">

                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-[#263246]">
                            {section.title}
                          </h3>

                          <span className="text-[12px] text-[#7b8797]">
                           ⌄
                          </span>
                        </div>

                        <p className="mt-2 text-[11px] leading-5 text-[#7b8797]">
                          {section.description}
                        </p>

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </section>

            {/* REVIEWS */}
            <section className="mt-8">

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-[#172033]">
                  Traveler Reviews
                </h2>

                <button className="text-[10px] font-medium text-[#657083]">
                  View All Reviews
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {reviews.map((review) => (
                  <div
                    key={review.name}
                    className="rounded-xl border border-[#e2e8ef] bg-white p-4"
                  >
                    <div className="flex items-start justify-between">

                      <div>
                        <div className="text-[12px] font-bold text-[#263246]">
                          {review.name}
                        </div>

                        <div className="mt-1 text-[10px] text-[#f28a19]">
                          ★★★★★
                        </div>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f4f7] text-[10px] font-bold text-[#657083]">
                        {review.avatar}
                      </div>

                    </div>

                    <p className="mt-3 text-[10px] leading-5 text-[#7b8797]">
                      "{review.text}"
                    </p>
                  </div>
                ))}

              </div>
            </section>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5">

            {/* BOOKING CARD */}
            <div className="rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-[0_5px_20px_rgba(25,45,75,0.05)]">

              <div className="mb-5">
                <div className="text-[10px] text-[#8a94a6]">
                  Starting from
                </div>

                <div className="mt-1 flex items-end gap-1">
                <span className="text-4xl font-bold text-[#172033]">
                    $599
                  </span>

                  <span className="pb-1 text-[10px] text-[#8a94a6]">
                    / person
                  </span>
                </div>
              </div>

              <Field label="Travel Date" value="05/12/2024" />
              <Field label="Travelers" value="2 Adults" />

              <div className="mt-4 rounded-xl bg-[#f7f9fb] p-4">

                <div className="flex justify-between text-[10px] text-[#687487]">
                  <span>Base price (2 travelers)</span>
                  <span>$1,198</span>
                </div>

                <div className="mt-2 flex justify-between text-[10px] text-[#687487]">
                  <span>Service fee</span>
                  <span>$48</span>
                </div>

                <div className="mt-3 border-t border-[#e4e8ee] pt-3">
                  <div className="flex justify-between text-[11px] font-bold text-[#263246]">
                    <span>Total</span>
                    <span>$1,246</span>
                  </div>
                </div>

              </div>

              <button className="mt-4 w-full rounded-lg bg-[#f59a23] py-3 text-[11px] font-bold text-white transition hover:bg-[#e98b12] ">
                BOOK NOW
              </button>

              <p className="mt-3 text-center text-[9px] leading-4 text-[#9aa3b1]">
                You won't be charged until your booking is confirmed.
              </p>

            </div>

            {/* PACKAGE INCLUDES */}
            <div className="rounded-xl border border-[#dfe5ec] bg-white p-5">

              <h3 className="text-[13px] font-bold text-[#263246]">
                Package Includes
              </h3>

              <ul className="mt-4 space-y-3">

                {[
                  "6 nights accommodation",
                  "Daily breakfast",
                  "Airport transfers",
                  "Local guide",
                  "Selected activities",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[10px] text-[#727d8e]"
                  >
                    <span className="text-[#22b573]">✓</span>
                    {item}
                  </li>
                ))}

              </ul>

            </div>

          </aside>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />

    </main>
  );
}

function InfoItem({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f7fa] text-[11px] text-[#596579]">
        {icon}
      </div>

      <span className="text-[10px] font-medium text-[#596579]">
        {text}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-[10px] font-medium text-[#788395]">
        {label}
      </label>

      <div className="flex h-10 items-center justify-between rounded-lg border border-[#dfe5ec] bg-white px-3 text-[10px] text-[#596579]">
        <span>{value}</span>
        <span className="text-[#8791a0]">⌄</span>
      </div>
    </div>
  );
}