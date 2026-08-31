import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { requireSession } from "@/lib/auth/session";
import { resolveMongoUser } from "@/lib/auth/resolve-user";
import { updateProfileSchema } from "@/lib/validations/auth";

// GET /api/auth/profile — get logged-in user's profile
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    // Resolves by email, creates Mongoose record on first OAuth login
    const user = await resolveMongoUser(session);

    return NextResponse.json(
      { success: true, data: { user } },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status)
      return NextResponse.json(
        { success: false, message: e.message },
        { status: e.status }
      );
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/profile — update logged-in user's profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email: session.email },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).select(
      "-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Profile updated", data: { user } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status)
      return NextResponse.json(
        { success: false, message: e.message },
        { status: e.status }
      );
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
