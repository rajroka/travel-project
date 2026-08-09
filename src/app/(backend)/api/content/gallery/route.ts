import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Gallery } from "@/lib/db/models/Gallery";
import { requireRole } from "@/lib/auth/session";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/content/gallery â€” public
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const category = req.nextUrl.searchParams.get("category");
    const { skip } = paginate(page, limit);

    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category;

    const [images, total] = await Promise.all([
      Gallery.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Gallery.countDocuments(filter),
    ]);

    return NextResponse.json(
      { success: true, data: { images, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET gallery error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/content/gallery/:id â€” admin/staff
export async function DELETE(req: NextRequest) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();

    const { id } = await req.json() as { id: string };
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    const image = await Gallery.findByIdAndDelete(id);
    if (!image) {
      return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Image removed from gallery" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
