import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { comparePassword, hashPassword } from "@/lib/auth/auth";
import { requireSession } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await User.findById(session.userId).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Change password error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
