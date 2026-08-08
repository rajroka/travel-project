import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Booking } from "@/lib/db/models/Booking";
import { requireRole } from "@/lib/auth/session";

// GET /api/reports/bookings?startDate=&endDate=&status=
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");
    const status = req.nextUrl.searchParams.get("status");

    const matchStage: Record<string, unknown> = {};
    if (status) matchStage.status = status;
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) (matchStage.createdAt as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (matchStage.createdAt as Record<string, Date>).$lte = new Date(endDate);
    }

    const [statusBreakdown, monthlyBookings, totalStats, recentBookings] = await Promise.all([
      Booking.aggregate([
        { $match: matchStage },
        { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      ]),
      Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            avgAmount: { $avg: "$totalAmount" },
          },
        },
      ]),
      Booking.find(matchStage)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("user", "firstName lastName email")
        .populate("package", "title price")
        .lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          statusBreakdown,
          monthlyBookings,
          summary: totalStats[0] ?? { total: 0, totalRevenue: 0, avgAmount: 0 },
          recentBookings,
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
