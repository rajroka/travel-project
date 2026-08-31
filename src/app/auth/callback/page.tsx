"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { getAuthoritativeDashboardPath } from "@/lib/auth/role-redirect";

/**
 * Post-OAuth callback page.
 * Better Auth redirects here after Google sign-in.
 * We fetch the Mongoose role from /api/auth/profile (authoritative)
 * instead of relying on the BA session role which may be stale.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const role = (session.user as { role?: string })?.role;
    getAuthoritativeDashboardPath(role).then((dashboardPath) => {
      router.replace(dashboardPath);
    });
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
        <p className="mt-4 text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}
