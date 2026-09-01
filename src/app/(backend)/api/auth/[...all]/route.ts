import { auth } from "@/lib/auth/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

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
export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(auth);
