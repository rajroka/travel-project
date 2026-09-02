"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";

const FAQS = [
  {
    q: "What should I carry while trekking?",
    a: "You should carry essential items such as a sturdy backpack, trekking poles, warm layers, waterproof jacket, sleeping bag, first aid kit, water purification tablets, sunscreen, and personal medications. We provide a detailed packing list upon booking.",
  },
  {
    q: "Is trekking dangerous?",
    a: "Trekking in Nepal is generally safe when done with proper preparation and a licensed guide. Risks include altitude sickness, unpredictable weather, and rough terrain. Our experienced guides are trained in first aid and altitude management to keep you safe.",
  },
  {
    q: "How long does a trek usually take?",
    a: "Trek duration varies by route. Short treks like Poon Hill take 4–5 days, while classic routes like Everest Base Camp take 14–16 days and the Annapurna Circuit takes 15–20 days. We offer packages ranging from 3 days to over 3 weeks.",
  },
  {
    q: "What kind of shoes are needed for trekking?",
    a: "We recommend waterproof, ankle-support trekking boots that are broken in before the trek. Avoid new boots as they can cause blisters. Lightweight trail runners are suitable for easier, lower-altitude treks.",
  },
  {
    q: "Why is trekking popular in Nepal?",
    a: "Nepal is home to 8 of the world's 14 highest peaks, stunning landscapes, rich cultural heritage, and warm hospitality. The well-established trail network, teahouse culture, and variety of difficulty levels make it accessible to all kinds of trekkers.",
  },
  {
    q: "Who can go trekking?",
    a: "Anyone with a reasonable level of fitness can trek in Nepal. We offer easy day hikes for beginners and challenging high-altitude expeditions for experienced trekkers. Age is not a barrier — we have hosted trekkers from age 10 to 75.",
  },
  {
    q: "What type of accommodation is provided?",
    a: "Most treks use teahouses — small guesthouses along the trail offering basic rooms and meals. Higher-end packages include lodge upgrades with attached bathrooms. Camping treks are also available for remote routes.",
  },
  {
    q: "Are meals provided during the trek?",
    a: "Yes, most packages include breakfast and dinner at teahouses or camps. Lunches are typically purchased on the trail. Menus include local Nepali food (dal bhat), as well as pasta, soups, and other dishes. Dietary requirements can be accommodated.",
  },
  {
    q: "Are guides experienced and licensed?",
    a: "All our guides and trekking staff are government-licensed, fluent in English, and have completed first aid and altitude sickness training. Many have completed the same routes hundreds of times and carry emergency oxygen and communication devices.",
  },
  {
    q: "How do I book a trek or tour package?",
    a: "You can browse and book directly through our website. Select your package, choose a travel date, fill in traveler details, and complete payment via Stripe. Our team will confirm your booking within 24 hours and send a detailed itinerary.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancellations made 14+ days before departure receive a full refund. Cancellations 7–13 days before departure receive a 50% refund. No refunds are issued within 7 days of the travel date. Please refer to our Terms of Service for full details.",
  },
  {
    q: "Do I need travel insurance?",
    a: "We strongly recommend comprehensive travel insurance that covers trekking at altitude, emergency evacuation, and medical expenses. Insurance is mandatory for high-altitude treks above 5,000m. We can suggest reliable providers on request.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-3xl px-6">

        {/* Heading */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Find answers to the most common questions about our trekking and tour
            packages in Nepal. If you don&apos;t find what you&apos;re looking for, feel free
            to{" "}
            <Link href="/about" className="text-blue-600 hover:underline">
              contact us
            </Link>
            !
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className={`text-sm font-semibold ${open === i ? "text-blue-700" : "text-gray-800"}`}>
                  {item.q}
                </span>
                <FiChevronDown
                  size={18}
                  className={`flex-shrink-0 text-blue-600 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>

              {open === i && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <p className="text-sm leading-6 text-gray-600">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
