import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Destination } from "@/lib/db/models/Destination";
import { requireRole } from "@/lib/auth/session";

// POST /api/destinations/:slug/images — add images to a destination
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { slug } = await params;

    const { images, coverImage } = await req.json() as { images?: string[]; coverImage?: string };

    const isObjectId = /^[a-f\d]{24}$/i.test(slug);
    const filter = isObjectId ? { _id: slug } : { slug };
    const updateOps: Record<string, unknown> = {};
    if (images?.length) updateOps.$push = { images: { $each: images } };
    if (coverImage) updateOps.$set = { coverImage };

    const destination = await Destination.findOneAndUpdate(filter, updateOps, { new: true });
    if (!destination) {
      return NextResponse.json({ success: false, message: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Images updated", data: { destination } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/destinations/:slug/images — remove an image URL
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { slug } = await params;

    const { imageUrl } = await req.json() as { imageUrl: string };
    if (!imageUrl) {
      return NextResponse.json({ success: false, message: "imageUrl is required" }, { status: 400 });
    }

    const isObjectId = /^[a-f\d]{24}$/i.test(slug);
    const destination = await Destination.findOneAndUpdate(
      isObjectId ? { _id: slug } : { slug },
      { $pull: { images: imageUrl } },
      { new: true }
    );
    if (!destination) {
      return NextResponse.json({ success: false, message: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Image removed", data: { destination } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
