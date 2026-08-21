import { auth } from "@/lib/auth/better-auth";

/**
 * Better Auth catch-all handler.
 * Handles all /api/auth/* routes:
 *   POST /api/auth/sign-up/email
 *   POST /api/auth/sign-in/email
 *   POST /api/auth/sign-out
 *   GET  /api/auth/sign-in/social?provider=google
 *   GET  /api/auth/callback/google
 *   POST /api/auth/forget-password
 *   POST /api/auth/reset-password
 *   GET  /api/auth/verify-email
 *   GET  /api/auth/get-session
 */
export async function GET(req: Request) {
  return auth.handler(req);
}

export async function POST(req: Request) {
  return auth.handler(req);
}
