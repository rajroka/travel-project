import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Destination } from "@/lib/db/models/Destination";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { SearchHistory } from "@/lib/db/models/SearchHistory";
import { UserRecommendation } from "@/lib/db/models/UserRecommendation";
import { getSession } from "@/lib/auth/session";

// GET /api/search?q=pokhara&type=destination|package|all
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const q = req.nextUrl.searchParams.get("q")?.trim();
    const type = req.nextUrl.searchParams.get("type") ?? "all";
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);

    if (!q || q.length < 2) {
      return NextResponse.json(
        { success: false, message: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const session = await getSession(req);
    const results: Record<string, unknown> = {};

    const searchRegex = { $regex: q, $options: "i" };

    // Search destinations
    if (type === "destination" || type === "all") {
      const destinations = await Destination.find({
        isActive: true,
        $or: [{ name: searchRegex }, { "location.city": searchRegex }, { "location.country": searchRegex }],
      })
        .limit(limit)
        .select("name slug coverImage location averageRating isFeatured")
        .lean();
      results.destinations = destinations;
    }

    // Search packages
    if (type === "package" || type === "all") {
      const packages = await TourPackage.find({
        isActive: true,
        $or: [{ title: searchRegex }, { shortDescription: searchRegex }],
      })
        .limit(limit)
        .select("title slug coverImage price duration averageRating isPromotional")
        .populate("destination", "name")
        .lean();
      results.packages = packages;
    }

    // Save search history async — don't block response
    SearchHistory.create({
      user: session?.userId,
      query: q.toLowerCase(),
      searchType: type === "all" ? "general" : type,
      resultsCount:
        ((results.destinations as unknown[])?.length ?? 0) +
        ((results.packages as unknown[])?.length ?? 0),
    }).catch(console.error);

    // If logged in, update recommendation base
    if (session) {
      UserRecommendation.findOneAndUpdate(
        { user: session.userId, basedOn: "search_history" },
        {
          $setOnInsert: { user: session.userId, basedOn: "search_history" },
          notificationSent: false,
        },
        { upsert: true }
      ).catch(console.error);
    }

    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
