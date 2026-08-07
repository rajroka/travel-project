import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { requireRole } from "@/lib/auth/session";

// POST /api/packages/:id/images — add images to a package
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const { images, coverImage } = await req.json() as { images?: string[]; coverImage?: string };

    const updateOps: Record<string, unknown> = {};
    if (images?.length) updateOps.$push = { images: { $each: images } };
    if (coverImage) updateOps.$set = { coverImage };

    const pkg = await TourPackage.findByIdAndUpdate(id, updateOps, { new: true });
    if (!pkg) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Images updated", data: { package: pkg } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/packages/:id/images — remove an image URL
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const { imageUrl } = await req.json() as { imageUrl: string };
    if (!imageUrl) {
      return NextResponse.json({ success: false, message: "imageUrl is required" }, { status: 400 });
    }

    const pkg = await TourPackage.findByIdAndUpdate(
      id,
      { $pull: { images: imageUrl } },
      { new: true }
    );
    if (!pkg) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Image removed", data: { package: pkg } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
