import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Destination } from "@/lib/db/models/Destination";

// GET /api/destinations/featured — public, featured destinations
export async function GET() {
  try {
    await connectDB();

    const destinations = await Destination.find({ isFeatured: true, isActive: true })
      .sort({ averageRating: -1 })
      .limit(8)
      .populate("category", "name slug")
      .select("name slug coverImage location averageRating totalReviews shortDescription bestSeason highlights")
      .lean();

    return NextResponse.json({ success: true, data: { destinations } }, { status: 200 });
  } catch (error) {
    console.error("GET featured destinations error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
