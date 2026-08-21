import { Suspense } from "react";
import SearchResults from "./SearchResults";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | Smart Tourism",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-400">Searching…</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
