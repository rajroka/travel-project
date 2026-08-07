import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { requireRole } from "@/lib/auth/session";
import { updatePackageSchema } from "@/lib/validations/package";

// GET /api/packages/:id — public, by ID or slug
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const pkg = await TourPackage.findOne(
      isObjectId ? { _id: id, isActive: true } : { slug: id, isActive: true }
    )
      .populate("destination", "name slug location coverImage")
      .populate("category", "name slug")
      .populate("createdBy", "firstName lastName");

    if (!pkg) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { package: pkg } }, { status: 200 });
  } catch (error) {
    console.error("GET package error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/packages/:id — staff/admin
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const parsed = updatePackageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const pkg = await TourPackage.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!pkg) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Package updated", data: { package: pkg } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/packages/:id — staff/admin (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const pkg = await TourPackage.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!pkg) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Package deleted" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
