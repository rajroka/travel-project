import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { Booking } from "@/lib/db/models/Booking";
import { requireRole } from "@/lib/auth/session";

// GET /api/reports/tour-popularity
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);

    const [packagesByBookings, packagesByRevenue, packagesByRating, bookingTrends] = await Promise.all([
      // Most booked packages
      TourPackage.find({ isActive: true })
        .sort({ totalBookings: -1 })
        .limit(limit)
        .select("title coverImage price totalBookings averageRating duration")
        .populate("destination", "name")
        .lean(),

      // Packages by revenue
      Booking.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: "$package", revenue: { $sum: "$totalAmount" }, bookingCount: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: limit },
        {
          $lookup: { from: "tourpackages", localField: "_id", foreignField: "_id", as: "package" },
        },
        { $unwind: "$package" },
        { $project: { "package.title": 1, "package.price": 1, revenue: 1, bookingCount: 1 } },
      ]),

      // Highest rated packages
      TourPackage.find({ isActive: true, totalReviews: { $gt: 0 } })
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(limit)
        .select("title coverImage averageRating totalReviews price")
        .lean(),

      // Booking trends by package per month
      Booking.aggregate([
        {
          $group: {
            _id: {
              package: "$package",
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 100 },
      ]),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { packagesByBookings, packagesByRevenue, packagesByRating, bookingTrends },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
