export default function PackageGallery() {
  return (
    <section className="relative grid grid-cols-1 gap-3 md:grid-cols-2">

      {/* Main Image */}
      <div className="relative h-[350px] overflow-hidden rounded-xl md:h-[500px]">
        <img
          src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop"
          alt="Pokhara, Nepal"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Photo count */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
          1 / 6 Photos
        </div>
      </div>

      {/* Right Images */}
      <div className="grid grid-cols-2 gap-3">

        {/* Image 2 */}
        <div className="h-[170px] overflow-hidden rounded-xl md:h-[240px]">
          <img
            src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=900&auto=format&fit=crop"
            alt="Paragliding in Pokhara"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Image 3 */}
        <div className="h-[170px] overflow-hidden rounded-xl md:h-[240px]">
          <img
            src="https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?q=80&w=900&auto=format&fit=crop"
            alt="Peace Pagoda"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Image 4 */}
        <div className="relative col-span-2 h-[200px] overflow-hidden rounded-xl md:h-[245px]">
          <img
            src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop"
            alt="Hotel room"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* View all photos */}
          <button className="absolute bottom-4 right-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-md transition hover:bg-gray-100">
            View all photos
          </button>
        </div>

      </div>
    </section>
  );
}