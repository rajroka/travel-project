import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/auth";
import { getSessionCookie } from "better-auth/cookies";

// ─── Route classification ────────────────────────────────────────────────────

/**
 * Routes handled entirely by Better Auth — always pass through.
 * Better Auth mounts its own handler at /api/auth/[...all]
 */
const BETTER_AUTH_PREFIX = "/api/auth";

/**
 * Completely public routes — no token or session needed.
 */
const PUBLIC_PREFIXES = [
  "/api/destinations",
  "/api/packages",
  "/api/reviews",
  "/api/search",
  "/api/content",
];

/** Admin only */
const ADMIN_PREFIXES = ["/api/users", "/api/reports", "/api/dashboard/admin"];

/** Staff or admin required for write operations */
const STAFF_PREFIXES = ["/api/staff"];

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard API routes
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  // Let Better Auth handle all its own routes
  if (pathname.startsWith(BETTER_AUTH_PREFIX)) return NextResponse.next();

  // Public read-only routes — no auth needed
  if (matchesAny(pathname, PUBLIC_PREFIXES)) return NextResponse.next();

  // ─── Check for either a Better Auth session cookie OR a JWT Bearer token ───

  // 1. Better Auth cookie (browser / frontend)
  const sessionCookie = getSessionCookie(req);

  // 2. JWT Bearer token (API clients / mobile)
  const authHeader = req.headers.get("authorization");
  const jwtToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const hasSession = !!sessionCookie || !!jwtToken;

  if (!hasSession) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  // Role-based checks only apply when using JWT (Better Auth role checks
  // happen inside the route handlers via requireRole())
  if (jwtToken && !sessionCookie) {
    try {
      const payload = verifyAccessToken(jwtToken);

      if (matchesAny(pathname, ADMIN_PREFIXES) && payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Forbidden. Admin access required." },
          { status: 403 }
        );
      }

      if (
        matchesAny(pathname, STAFF_PREFIXES) &&
        payload.role !== "staff" &&
        payload.role !== "admin"
      ) {
        return NextResponse.json(
          { success: false, message: "Forbidden. Staff access required." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Invalid or expired token." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
