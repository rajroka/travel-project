"use client";

// Staff package detail — redirect to the shared public detail page
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StaffPackageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/packages/${slug}`);
  }, [slug, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
    </div>
  );
}
