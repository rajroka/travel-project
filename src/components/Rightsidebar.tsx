export default function RightSidebar() {
  return (
    <div className="w-80 space-y-6">

      {/* Packages */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6">

        <h2 className="text-3xl font-bold mb-6">
          Top Matched Packages
        </h2>

        <div className="bg-slate-700 rounded-xl p-4 mb-4">
          <div className="flex justify-between">
            <span>Kyoto Luxury Explorer</span>
            <span className="text-yellow-400 font-bold">$1,850</span>
          </div>
        </div>

        <div className="bg-slate-700 rounded-xl p-4 mb-6">
          <div className="flex justify-between">
            <span>Essential Culture Pass</span>
            <span className="text-yellow-400 font-bold">$920</span>
          </div>
        </div>

        <button className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold  hover:scale-105 transition-all duration-300">
          View All Matches
        </button>

      </div>

      {/* Packing List */}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">

        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Packing List
        </h2>

        <ul className="space-y-3 text-gray-700">

          <li>✅ Japan Rail Pass</li>

          <li>✅ Portable Power Bank</li>

          <li>⬜ Walking Shoes</li>

          <li>⬜ IC Card</li>

          <li>⬜ Universal Adapter</li>

        </ul>

      </div>

    </div>
  );
}