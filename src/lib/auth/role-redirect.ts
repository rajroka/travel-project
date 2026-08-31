export type AppRole = "customer" | "staff" | "admin";

export function dashboardPathForRole(role?: string | null) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "staff") return "/staff/dashboard";
  return "/dashboard";
}

export async function getAuthoritativeDashboardPath(fallbackRole?: string | null) {
  try {
    const profileRes = await fetch("/api/auth/profile", {
      credentials: "include",
      cache: "no-store",
    });
    const profileJson = await profileRes.json() as {
      success: boolean;
      data?: { user?: { role?: string } };
    };

    return dashboardPathForRole(profileJson.data?.user?.role ?? fallbackRole);
  } catch {
    return dashboardPathForRole(fallbackRole);
  }
}
