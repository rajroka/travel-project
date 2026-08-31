import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/session";
import { getAuthInstance } from "@/lib/auth/better-auth";
import { z } from "zod";

// GET /api/users/:id — admin/staff view user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "admin", "staff");
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id)
      .select("-password -emailVerificationToken -passwordResetToken")
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { user } }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  role: z.enum({ customer: "customer", staff: "staff", admin: "admin" }).optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * PATCH /api/users/:id
 * Updates a user's role, active status, or profile fields.
 * Works for both Mongoose users (email sign-up) and Better Auth OAuth users.
 * When changing role, also updates the role in Better Auth's user table so
 * Google-OAuth users get the correct role on their next sign-in.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "admin");
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    // ── Update Mongoose User model ────────────────────────────────────────
    const mongoUser = await User.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true }
    ).select("-password -emailVerificationToken -passwordResetToken");

    // ── Also update Better Auth user (handles OAuth users) ───────────────
    // Better Auth stores users in its own collection with an `additionalFields.role`.
    // We update it so the role is correct on the next session fetch.
    if (parsed.data.role) {
      try {
        const authInstance = await getAuthInstance();
        // Use Better Auth's internal DB adapter to update the user record directly
        const db = (authInstance as unknown as { options: { database: { updateOne: (table: string, where: Record<string, unknown>, data: Record<string, unknown>) => Promise<unknown> } } }).options?.database;
        if (db?.updateOne) {
          await db.updateOne("user", { id }, { role: parsed.data.role });
        }
      } catch {
        // Best-effort — don't fail the request if BA update fails
      }
    }

    if (!mongoUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "User updated", data: { user: mongoUser } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("PATCH user error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/users/:id — admin soft-deactivate
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "admin");
    await connectDB();
    const { id } = await params;

    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deactivated" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
