import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/session";

// PATCH /api/users/:id/status — admin activate or deactivate a user
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "admin");
    await connectDB();
    const { id } = await params;

    const { isActive } = await req.json() as { isActive: boolean };
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive (boolean) is required" },
        { status: 422 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password -emailVerificationToken -passwordResetToken");

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"}`,
        data: { user },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
