import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SearchHistory } from "@/lib/db/models/SearchHistory";
import { requireRole } from "@/lib/auth/session";

// GET /api/reports/search-analytics
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [topSearches, searchByType, searchTrends, uniqueUsers] = await Promise.all([
      // Most searched queries
      SearchHistory.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$query", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { query: "$_id", count: 1, _id: 0 } },
      ]),

      // Search by type
      SearchHistory.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$searchType", count: { $sum: 1 } } },
      ]),

      // Daily search volume
      SearchHistory.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      // Unique searchers
      SearchHistory.distinct("user", { createdAt: { $gte: since }, user: { $ne: null } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          topSearches,
          searchByType,
          searchTrends,
          uniqueSearchers: uniqueUsers.length,
          totalSearches: await SearchHistory.countDocuments({ createdAt: { $gte: since } }),
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
