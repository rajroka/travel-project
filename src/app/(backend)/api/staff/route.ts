import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/session";
import { getAuthInstance } from "@/lib/auth/better-auth";
import { z } from "zod";

const createStaffSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

// GET /api/staff — admin: list all staff
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      User.find({ role: "staff" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password -emailVerificationToken -passwordResetToken")
        .lean(),
      User.countDocuments({ role: "staff" }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          staff,
          pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/staff — admin: create staff account
// Creates the user in Better Auth (so email/password login works) AND in the
// Mongoose User model (so the rest of the app can look them up).
export async function POST(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const body = await req.json();
    const parsed = createStaffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { firstName, lastName, email, password, phone } = parsed.data;
    const fullName = `${firstName} ${lastName}`;

    // ── Check for existing user in Mongoose ──────────────────────────────
    const existingMongo = await User.findOne({ email });
    if (existingMongo) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    // ── 1. Create in Better Auth so login works ──────────────────────────
    // Better Auth's server-side signUpEmail creates the user in BA's collection
    // with a hashed password that its sign-in flow can verify.
    const authInstance = await getAuthInstance();
    const baResult = await authInstance.api.signUpEmail({
      body: {
        name: fullName,
        email,
        password,
      },
    });

    if (!baResult?.user) {
      return NextResponse.json(
        { success: false, message: "Failed to create authentication account" },
        { status: 500 }
      );
    }

    // ── 2. Update the role in Better Auth's user record to "staff" ───────
    // Better Auth defaults new users to role: "customer" via additionalFields.
    // We need to patch it to "staff" directly in the BA database.
    try {
      const db = (authInstance as unknown as {
        options?: {
          database?: {
            updateOne?: (
              table: string,
              where: Record<string, unknown>,
              data: Record<string, unknown>
            ) => Promise<unknown>;
          };
        };
      }).options?.database;

      if (db?.updateOne) {
        await db.updateOne("user", { id: baResult.user.id }, { role: "staff" });
      }
    } catch {
      // Non-fatal — role update is best-effort; Mongoose record will be authoritative
    }

    // ── 3. Create in Mongoose User model ─────────────────────────────────
    // The rest of the app (bookings, dashboard, etc.) looks up users in Mongoose.
    // Store the Better Auth user ID as the _id so both systems share the same ID.
    const staff = await User.create({
      _id: baResult.user.id,        // use BA's id so PATCH /api/users/:id works
      firstName,
      lastName,
      email,
      password: "better-auth",      // placeholder — actual password is in BA
      phone,
      role: "staff",
      isEmailVerified: true,        // admin-created accounts skip verification
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff account created. They can now log in with their email and password.",
        data: {
          staff: {
            id: staff._id,
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            role: staff.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Create staff error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
