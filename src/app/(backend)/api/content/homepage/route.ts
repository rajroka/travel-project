import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Destination } from "@/lib/db/models/Destination";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { Gallery } from "@/lib/db/models/Gallery";

// GET /api/content/homepage — public, aggregated homepage data
export async function GET() {
  try {
    await connectDB();

    const [featuredDestinations, featuredPackages, promotionalPackages, bannerImages, stats] =
      await Promise.all([
        Destination.find({ isFeatured: true, isActive: true })
          .sort({ averageRating: -1 })
          .limit(6)
          .select("name slug coverImage location averageRating totalReviews shortDescription")
          .lean(),

        TourPackage.find({ isActive: true })
          .sort({ totalBookings: -1, averageRating: -1 })
          .limit(6)
          .select("title slug coverImage price discountPrice duration averageRating totalReviews isPromotional")
          .populate("destination", "name")
          .lean(),

        TourPackage.find({ isActive: true, isPromotional: true })
          .sort({ createdAt: -1 })
          .limit(4)
          .select("title slug coverImage price discountPrice duration promotionExpiry")
          .populate("destination", "name")
          .lean(),

        Gallery.find({ category: "banner", isActive: true })
          .sort({ sortOrder: 1 })
          .limit(5)
          .select("imageUrl title")
          .lean(),

        // Quick stats
        Promise.all([
          Destination.countDocuments({ isActive: true }),
          TourPackage.countDocuments({ isActive: true }),
        ]).then(([destinations, packages]) => ({ destinations, packages })),
      ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          featuredDestinations,
          featuredPackages,
          promotionalPackages,
          bannerImages,
          stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET homepage error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
