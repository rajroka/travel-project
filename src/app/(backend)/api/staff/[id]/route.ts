import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/session";
import { z } from "zod";

const updateStaffSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/staff/:id — admin
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "admin");
    await connectDB();
    const { id } = await params;

    const staff = await User.findOne({ _id: id, role: "staff" })
      .select("-password -emailVerificationToken -passwordResetToken")
      .lean();

    if (!staff) {
      return NextResponse.json({ success: false, message: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { staff } }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/staff/:id — admin update staff details
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "admin");
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateStaffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const staff = await User.findOneAndUpdate(
      { _id: id, role: "staff" },
      { $set: parsed.data },
      { new: true }
    ).select("-password -emailVerificationToken -passwordResetToken");

    if (!staff) {
      return NextResponse.json({ success: false, message: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Staff updated", data: { staff } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/staff/:id — admin deactivate staff account
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "admin");
    await connectDB();
    const { id } = await params;

    const staff = await User.findOneAndUpdate(
      { _id: id, role: "staff" },
      { isActive: false },
      { new: true }
    );

    if (!staff) {
      return NextResponse.json({ success: false, message: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Staff account deactivated" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
