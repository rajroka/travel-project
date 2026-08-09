import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SearchHistory } from "@/lib/db/models/SearchHistory";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { Booking } from "@/lib/db/models/Booking";
import { Favorite } from "@/lib/db/models/Favorite";
import { requireSession } from "@/lib/auth/session";

// GET /api/recommendations â€” personalized recommendations for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 8);

    // Build recommendation from multiple signals
    const [recentSearches, recentBookings, favorites] = await Promise.all([
      SearchHistory.find({ user: session.userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .distinct("query"),
      Booking.find({ user: session.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("package", "destination category")
        .lean(),
      Favorite.find({ user: session.userId })
        .limit(10)
        .select("destination")
        .lean(),
    ]);

    // Collect destination IDs from bookings and favorites
    const destinationIds = [
      ...recentBookings
        .map((b) => {
          const pkg = b.package as { destination?: string } | null;
          return pkg?.destination;
        })
        .filter(Boolean),
      ...favorites.map((f) => String(f.destination)),
    ];

    // Find packages matching interests
    const queryTerms = recentSearches.slice(0, 5);
    const orConditions: Record<string, unknown>[] = [];

    if (queryTerms.length > 0) {
      orConditions.push({
        $or: queryTerms.map((q) => ({ title: { $regex: q, $options: "i" } })),
      });
    }

    if (destinationIds.length > 0) {
      orConditions.push({ destination: { $in: destinationIds } });
    }

    const filter: Record<string, unknown> = { isActive: true };
    if (orConditions.length > 0) filter.$or = orConditions.flatMap((c) => (c.$or as Record<string, unknown>[]) || [c]);

    const recommended = await TourPackage.find(filter)
      .sort({ averageRating: -1, totalBookings: -1 })
      .limit(limit)
      .select("title slug coverImage price duration averageRating totalReviews isPromotional")
      .populate("destination", "name slug")
      .lean();

    // Fallback: top-rated packages if no personalized data
    if (recommended.length < limit) {
      const fallback = await TourPackage.find({ isActive: true })
        .sort({ averageRating: -1 })
        .limit(limit - recommended.length)
        .select("title slug coverImage price duration averageRating totalReviews")
        .populate("destination", "name slug")
        .lean();

      const existingIds = new Set(recommended.map((p) => String(p._id)));
      recommended.push(...fallback.filter((p) => !existingIds.has(String(p._id))));
    }

    return NextResponse.json(
      { success: true, data: { recommendations: recommended } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
