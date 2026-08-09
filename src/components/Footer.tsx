export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white mt-10">
      <div className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold">
            nepaltravels
          </h2>

          <p className="text-gray-400 mt-2">
            © 2024 nepaltravels Tours & Travels.
            All rights reserved.
          </p>
        </div>

        <div className="flex gap-8 text-gray-300">
          <a href="#">Contact Us</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">FAQ</a>
        </div>

      </div>
    </footer>
  );
}