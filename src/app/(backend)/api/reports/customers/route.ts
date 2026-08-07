import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { Booking } from "@/lib/db/models/Booking";
import { requireRole } from "@/lib/auth/session";

// GET /api/reports/customers
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const [
      totalCustomers,
      activeCustomers,
      newThisMonth,
      topCustomers,
      registrationsByMonth,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "customer", isActive: true }),
      User.countDocuments({
        role: "customer",
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
      // Top customers by booking count
      Booking.aggregate([
        { $group: { _id: "$user", bookingCount: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            "user.firstName": 1,
            "user.lastName": 1,
            "user.email": 1,
            bookingCount: 1,
            totalSpent: 1,
          },
        },
      ]),
      // Monthly registrations
      User.aggregate([
        { $match: { role: "customer" } },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: { totalCustomers, activeCustomers, inactiveCustomers: totalCustomers - activeCustomers, newThisMonth },
          topCustomers,
          registrationsByMonth,
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
