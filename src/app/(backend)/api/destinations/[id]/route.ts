import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Destination } from "@/lib/db/models/Destination";
import { requireRole } from "@/lib/auth/session";
import { updateDestinationSchema } from "@/lib/validations/destination";

// GET /api/destinations/:id — public, by ID or slug
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const destination = await Destination.findOne(
      isObjectId ? { _id: id, isActive: true } : { slug: id, isActive: true }
    )
      .populate("category", "name slug")
      .populate("createdBy", "firstName lastName");

    if (!destination) {
      return NextResponse.json({ success: false, message: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { destination } }, { status: 200 });
  } catch (error) {
    console.error("GET destination error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/destinations/:id — staff/admin
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateDestinationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const destination = await Destination.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!destination) {
      return NextResponse.json({ success: false, message: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Destination updated", data: { destination } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/destinations/:id — staff/admin (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const destination = await Destination.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!destination) {
      return NextResponse.json({ success: false, message: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Destination deleted" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
