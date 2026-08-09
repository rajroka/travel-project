import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { TourPackage } from "@/lib/db/models/TourPackage";

// GET /api/packages/compare?ids=id1,id2,id3 — public, compare up to 4 packages
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const idsParam = req.nextUrl.searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json(
        { success: false, message: "ids query parameter is required (comma-separated)" },
        { status: 400 }
      );
    }

    const ids = idsParam.split(",").map((id) => id.trim()).slice(0, 4);

    if (ids.length < 2) {
      return NextResponse.json(
        { success: false, message: "At least 2 package IDs are required for comparison" },
        { status: 400 }
      );
    }

    const packages = await TourPackage.find({ _id: { $in: ids }, isActive: true })
      .populate("destination", "name slug location")
      .populate("category", "name slug")
      .lean();

    if (packages.length < 2) {
      return NextResponse.json(
        { success: false, message: "Could not find enough valid packages to compare" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { packages } }, { status: 200 });
  } catch (error) {
    console.error("Compare packages error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
