import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./auth";
import { auth } from "./better-auth";

// ─── Unified session type ─────────────────────────────────────────────────────

export interface AppSession {
  userId: string;
  email: string;
  role: "customer" | "staff" | "admin";
  /** "jwt" for custom API routes | "better-auth" for Better Auth managed routes */
  source: "jwt" | "better-auth";
}

// ─── Better Auth server-side session ─────────────────────────────────────────

/**
 * Get Better Auth session from request headers (for use inside Route Handlers).
 */
export async function getBetterAuthSession(
  req: NextRequest
): Promise<AppSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });
    if (!session?.user) return null;

    const user = session.user as {
      id: string;
      email: string;
      role?: string;
    };

    return {
      userId: user.id,
      email: user.email,
      role: (user.role as AppSession["role"]) ?? "customer",
      source: "better-auth",
    };
  } catch {
    return null;
  }
}

// ─── JWT session (legacy / machine-to-machine) ────────────────────────────────

/**
 * Get JWT session from Authorization: Bearer <token> header.
 */
export function getJwtSession(req: NextRequest): AppSession | null {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      source: "jwt",
    };
  } catch {
    return null;
  }
}

// ─── Unified helpers ──────────────────────────────────────────────────────────

/**
 * Try JWT first (for API clients), then fall back to Better Auth cookie session.
 */
export async function getSession(req: NextRequest): Promise<AppSession | null> {
  return getJwtSession(req) ?? (await getBetterAuthSession(req));
}

/**
 * Requires a valid session. Throws a structured error if not authenticated.
 */
export async function requireSession(req: NextRequest): Promise<AppSession> {
  const session = await getSession(req);
  if (!session) {
    throw { status: 401, message: "Unauthorized. Please log in." };
  }
  return session;
}

/**
 * Requires a specific role.
 */
export async function requireRole(
  req: NextRequest,
  ...roles: AppSession["role"][]
): Promise<AppSession> {
  const session = await requireSession(req);
  if (!roles.includes(session.role)) {
    throw { status: 403, message: "Forbidden. Insufficient permissions." };
  }
  return session;
}

/**
 * Normalise a caught error into a status+message pair.
 */
export function authError(err: unknown): { status: number; message: string } {
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err
  ) {
    return err as { status: number; message: string };
  }
  return { status: 500, message: "Internal server error" };
}
