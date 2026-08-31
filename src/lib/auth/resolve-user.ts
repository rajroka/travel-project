import { User } from "@/lib/db/models/User";
import type { AppSession } from "./session";

/**
 * Resolve the Mongoose user from a Better Auth session.
 * Creates a Mongoose record on first OAuth login if one doesn't exist.
 */
export async function resolveMongoUser(session: AppSession) {
  let user = await User.findOne({ email: session.email }).select("_id role firstName lastName email");

  if (!user) {
    // Parse name from email prefix: "john.doe@..." → firstName="John", lastName="Doe"
    const emailPrefix = session.email.split("@")[0] ?? "user";
    const parts = emailPrefix.split(/[._-]/);
    const firstName = capitalize(parts[0] ?? "User");
    // lastName must be non-empty per schema — use email prefix if no last name found
    const lastName = parts.length > 1 ? capitalize(parts[1]) : capitalize(emailPrefix);

    user = await User.create({
      firstName,
      lastName,
      email: session.email,
      password: "oauth-placeholder",
      role: (session.role as string) ?? "customer",
      isActive: true,
      isEmailVerified: true,
    });
  }

  return user;
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "User";
}
