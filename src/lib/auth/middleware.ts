import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./auth";

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/destinations",
  "/api/packages",
  "/api/reviews",
  "/api/search",
  "/api/content",
];

// Routes restricted to staff or admin
const STAFF_PATHS = ["/api/staff", "/api/bookings/approve", "/api/bookings/reject"];

// Routes restricted to admin only
const ADMIN_PATHS = ["/api/users", "/api/reports", "/api/dashboard/admin"];

export function authMiddleware(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Token missing." },
      { status: 401 }
    );
  }

  try {
    const payload = verifyAccessToken(token);

    // Admin-only routes
    if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      if (payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Forbidden. Admin access required." },
          { status: 403 }
        );
      }
    }

    // Staff or admin routes
    if (STAFF_PATHS.some((p) => pathname.startsWith(p))) {
      if (payload.role !== "staff" && payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Forbidden. Staff access required." },
          { status: 403 }
        );
      }
    }

    return null; // Allow the request
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Invalid or expired token." },
      { status: 401 }
    );
  }
}
