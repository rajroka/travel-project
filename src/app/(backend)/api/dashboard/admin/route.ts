import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { Booking } from "@/lib/db/models/Booking";
import { Payment } from "@/lib/db/models/Payment";
import { Destination } from "@/lib/db/models/Destination";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { SearchHistory } from "@/lib/db/models/SearchHistory";
import { requireRole } from "@/lib/auth/session";

// GET /api/dashboard/admin
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalCustomers,
      totalStaff,
      totalBookings,
      pendingBookings,
      revenueData,
      monthlyRevenue,
      dailyRevenue,
      pendingPayments,
      completedPayments,
      refundedPayments,
      recentBookings,
      popularPackages,
      popularDestinations,
      topSearches,
      paymentMethodStats,
    ] = await Promise.all([
      User.countDocuments({ role: "customer", isActive: true }),
      User.countDocuments({ role: "staff", isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),

      // Total revenue (all time paid)
      Payment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Monthly revenue
      Payment.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Daily revenue
      Payment.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      Payment.countDocuments({ paymentStatus: "pending" }),
      Payment.countDocuments({ paymentStatus: "paid" }),
      Payment.countDocuments({ paymentStatus: "refunded" }),

      // Recent bookings
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "firstName lastName email")
        .populate("package", "title price")
        .lean(),

      // Popular packages by bookings
      TourPackage.find({ isActive: true })
        .sort({ totalBookings: -1 })
        .limit(5)
        .select("title coverImage price totalBookings averageRating")
        .lean(),

      // Popular destinations by reviews
      Destination.find({ isActive: true })
        .sort({ totalReviews: -1, averageRating: -1 })
        .limit(5)
        .select("name coverImage location averageRating totalReviews")
        .lean(),

      // Top searches
      SearchHistory.aggregate([
        { $group: { _id: "$query", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { query: "$_id", count: 1, _id: 0 } },
      ]),

      // Payment method breakdown
      Payment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
    ]);

    // Monthly cashflow chart (last 12 months)
    const cashflow = await Payment.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          overview: {
            totalCustomers,
            totalStaff,
            totalBookings,
            pendingBookings,
            totalRevenue: revenueData[0]?.total ?? 0,
            monthlyRevenue: monthlyRevenue[0]?.total ?? 0,
            dailyRevenue: dailyRevenue[0]?.total ?? 0,
            pendingPayments,
            completedPayments,
            refundedPayments,
          },
          recentBookings,
          popularPackages,
          popularDestinations,
          topSearches,
          paymentMethodStats,
          cashflow,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Admin dashboard error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
