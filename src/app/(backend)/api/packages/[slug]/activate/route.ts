import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { requireRole } from "@/lib/auth/session";

// PATCH /api/packages/:slug/activate — staff/admin toggle active status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();
    const { slug } = await params;

    const body = await req.json();
    const { isActive } = body as { isActive: boolean };

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive (boolean) is required" },
        { status: 422 }
      );
    }

    const isObjectId = /^[a-f\d]{24}$/i.test(slug);
    const pkg = await TourPackage.findOneAndUpdate(
      isObjectId ? { _id: slug } : { slug },
      { isActive },
      { new: true }
    );
    if (!pkg) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Package ${isActive ? "activated" : "deactivated"}`,
        data: { package: pkg },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
