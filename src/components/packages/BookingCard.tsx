"use client";

import { useState } from "react";

export default function BookingCard() {
  const [travelers, setTravelers] = useState(2);

  const pricePerPerson = 599;
  const serviceFee = pricePerPerson * travelers * 0.1;
  const subtotal = pricePerPerson * travelers;
  const total = subtotal + serviceFee;

  return (
    <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-lg lg:sticky lg:top-24">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Starts from
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            ${pricePerPerson}
          </p>

          <p className="text-xs text-gray-500">
            / person
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-xs font-medium text-gray-700">
          Select Date
        </label>

        <input
          type="date"
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-gray-700">
          Travelers
        </label>

        <select
          value={travelers}
          onChange={(e) => setTravelers(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600"
        >
          <option value={1}>1 Adult</option>
          <option value={2}>2 Adults</option>
          <option value={3}>3 Adults</option>
          <option value={4}>4 Adults</option>
          <option value={5}>5 Adults</option>
        </select>
      </div>

      <div className="mt-5 rounded-lg bg-blue-50 p-3 text-sm">
        <div className="flex justify-between">
          <span>
            ${pricePerPerson} × {travelers}
          </span>

          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="mt-2 flex justify-between">
          <span>Service Fee (10%)</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>

        <div className="mt-3 border-t border-blue-200 pt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>

            <span className="text-blue-900">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <button className="mt-5 w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600">
        BOOK NOW
      </button>

      <div className="mt-6 space-y-3 text-xs text-gray-600">
        <p>✓ Free cancellation before May 10</p>
        <p>✓ Secure booking</p>
      </div>

      <div className="mt-5 rounded-lg bg-orange-50 p-3 text-xs leading-5 text-gray-600">
        ✨ Our AI suggests adding a private helicopter tour for
        $250 extra.
      </div>
    </aside>
  );
}