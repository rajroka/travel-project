import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for use in React components and client-side code.
 *
 * Usage examples:
 *
 *   // Email sign-up
 *   await authClient.signUp.email({ name, email, password })
 *
 *   // Email sign-in
 *   await authClient.signIn.email({ email, password })
 *
 *   // Google OAuth (redirect flow)
 *   await authClient.signIn.social({ provider: "google" })
 *
 *   // Sign out
 *   await authClient.signOut()
 *
 *   // Get session reactively
 *   const { data: session } = authClient.useSession()
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  resetPassword,
  sendVerificationEmail,
} = authClient;
