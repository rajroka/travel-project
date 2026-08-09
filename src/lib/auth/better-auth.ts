import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { nextCookies } from "better-auth/next-js";

// Use a cached MongoClient for serverless (Next.js hot-reload safe)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

const client: MongoClient = global._mongoClient ?? new MongoClient(MONGODB_URI);
if (!global._mongoClient) global._mongoClient = client;

const db = client.db();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  database: mongodbAdapter(db, { client }),

  // ─── Email + Password ──────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // set true in production
    sendResetPassword: async ({ user, url }) => {
      // Import lazily to avoid circular deps
      const { sendMail, passwordResetTemplate } = await import("@/lib/email/mailer");
      await sendMail({
        to: user.email,
        subject: "Reset your password - Smart Tourism",
        html: passwordResetTemplate(user.name.split(" ")[0], url),
        userId: user.id,
        templateType: "password_reset",
      });
    },
  },

  // ─── Email Verification ────────────────────────────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { sendMail, welcomeEmailTemplate } = await import("@/lib/email/mailer");
      await sendMail({
        to: user.email,
        subject: "Verify your email - Smart Tourism",
        html: welcomeEmailTemplate(user.name.split(" ")[0], url),
        userId: user.id,
        templateType: "email_verification",
      });
    },
  },

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },

  // ─── User model extra fields ───────────────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // not settable by the user on sign-up
      },
      phone: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        input: false,
      },
    },
  },

  // ─── Session ───────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7,        // 7 days
    updateAge: 60 * 60 * 24,            // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                   // cache for 5 min
    },
  },

  // ─── Trusted origins ──────────────────────────────────────────────────────
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ],

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type BetterAuthUser = typeof auth.$Infer.Session.user;
