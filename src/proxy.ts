import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtEdge } from "@/lib/auth/jwt-edge";

// ─── Route classification ────────────────────────────────────────────────────

/** Better Auth owns all /api/auth/* — always pass through */
const BETTER_AUTH_PREFIX = "/api/auth";

/** Completely public — no session needed */
const PUBLIC_PREFIXES = [
  "/api/destinations",
  "/api/packages",
  "/api/reviews",
  "/api/search",
  "/api/content",
];

/** Admin only */
const ADMIN_PREFIXES = ["/api/users", "/api/reports", "/api/dashboard/admin"];

/** Staff or admin only */
const STAFF_PREFIXES = ["/api/staff"];

// Better Auth default session cookie name
const BA_SESSION_COOKIE = "better-auth.session_token";

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname.startsWith(p));
}

function getSessionCookie(req: NextRequest): string | undefined {
  // Try the default Better Auth session cookie name
  return (
    req.cookies.get(BA_SESSION_COOKIE)?.value ??
    req.cookies.get("__Secure-better-auth.session_token")?.value
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard API routes
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  // Let Better Auth handle its own routes
  if (pathname.startsWith(BETTER_AUTH_PREFIX)) return NextResponse.next();

  // Public routes — no auth needed
  if (matchesAny(pathname, PUBLIC_PREFIXES)) return NextResponse.next();

  // ─── Check session: Better Auth cookie OR JWT Bearer ─────────────────────

  const sessionCookie = getSessionCookie(req);
  const authHeader = req.headers.get("authorization");
  const jwtToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // If neither exists, reject
  if (!sessionCookie && !jwtToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  // Role checks only apply to JWT (BA cookie role checks happen inside route handlers)
  if (jwtToken && !sessionCookie) {
    const secret = process.env.JWT_SECRET ?? "";
    const payload = await verifyJwtEdge(jwtToken, secret);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Invalid or expired token." },
        { status: 401 }
      );
    }

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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
