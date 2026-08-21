import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, Db } from "mongodb";
import { nextCookies } from "better-auth/next-js";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

// ─── Cached MongoClient (hot-reload safe, no top-level await) ────────────────

declare global {
  // eslint-disable-next-line no-var
  var _baMongoPromise: Promise<{ client: MongoClient; db: Db }> | undefined;
}

function getMongoConnection(): Promise<{ client: MongoClient; db: Db }> {
  if (!global._baMongoPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    global._baMongoPromise = client.connect().then((c) => ({
      client: c,
      db: c.db(),
    }));
  }
  return global._baMongoPromise;
}

// ─── Better Auth with lazy database initialization ───────────────────────────
// betterAuth accepts a database getter that can return a Promise.
// This avoids top-level await while ensuring the client is connected.

// We initialise a single auth instance per process.
declare global {
  // eslint-disable-next-line no-var
  var _authInstance: ReturnType<typeof betterAuth> | undefined;
}

async function buildAuth(): Promise<ReturnType<typeof betterAuth>> {
  if (global._authInstance) return global._authInstance;
  const { client, db } = await getMongoConnection();

  global._authInstance = betterAuth({
    baseURL:
      process.env.BETTER_AUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000",

    database: mongodbAdapter(db, { client }),

    // ─── Email + Password ──────────────────────────────────────────────────
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        // Fire-and-forget — never block auth flow on email failure
        import("@/lib/email/mailer").then(({ sendMail, passwordResetTemplate }) => {
          sendMail({
            to: user.email,
            subject: "Reset your password - Smart Tourism",
            html: passwordResetTemplate(user.name.split(" ")[0], url),
            userId: user.id,
            templateType: "password_reset",
          }).catch(console.error);
        }).catch(console.error);
      },
    },

    // ─── Email Verification ──────────────────────────────────────────────────
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        // Fire-and-forget — never block auth flow on email failure
        import("@/lib/email/mailer").then(({ sendMail, welcomeEmailTemplate }) => {
          sendMail({
            to: user.email,
            subject: "Verify your email - Smart Tourism",
            html: welcomeEmailTemplate(user.name.split(" ")[0], url),
            userId: user.id,
            templateType: "email_verification",
          }).catch(console.error);
        }).catch(console.error);
      },
    },

    // ─── Google OAuth ────────────────────────────────────────────────────────
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        prompt: "select_account",
      },
    },

    // ─── User extra fields ───────────────────────────────────────────────────
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "customer",
          input: false,
        },
        phone: {
          type: "string",
          defaultValue: "",
          input: true, // allow setting on sign-up if needed
        },
        isActive: {
          type: "boolean",
          defaultValue: true,
          input: false,
        },
      },
    },

    // ─── Session ─────────────────────────────────────────────────────────────
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },

    // ─── Trusted origins ─────────────────────────────────────────────────────
    trustedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    ],

    plugins: [nextCookies()],
  });

  return global._authInstance;
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

/**
 * Get the fully initialised (database-connected) auth instance.
 * Call this in route handlers before using auth.handler or auth.api.
 */
export { buildAuth as getAuth };

/**
 * Convenience: get the auth instance for use in session.ts (server-side).
 */
export async function getAuthInstance() {
  return buildAuth();
}

// For toNextJsHandler compatibility we export a handler-compatible object.
// The catch-all route uses this directly.
export const auth = {
  handler: async (req: Request) => {
    const instance = await buildAuth();
    return instance.handler(req);
  },
  api: {
    getSession: async (opts: { headers: Headers }) => {
      const instance = await buildAuth();
      return instance.api.getSession(opts);
    },
  },
} as ReturnType<typeof betterAuth>;

export type Session = Awaited<ReturnType<typeof buildAuth>>["$Infer"]["Session"];
export type BetterAuthUser = Session["user"];
