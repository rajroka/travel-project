import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Booking } from "@/lib/db/models/Booking";
import { Payment } from "@/lib/db/models/Payment";
import { User } from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/session";

// GET /api/dashboard/staff
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "staff", "admin");
    await connectDB();

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalBookings,
      totalCustomers,
      pendingApprovalsCount,
      pendingCashPaymentsCount,
      allPendingPaymentsCount,
      completedPaymentsCount,
      totalRevenueData,
      todayBookings,
      pendingApprovals,
      recentCustomers,
      pendingPayments,
      recentPayments,
      upcomingSchedule,
    ] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments({ role: "customer", isActive: true }),
      Booking.countDocuments({ status: "pending" }),
      Payment.countDocuments({ paymentStatus: "pending", paymentMethod: "cash" }),
      Payment.countDocuments({ paymentStatus: "pending" }),
      Payment.countDocuments({ paymentStatus: "paid" }),
      Payment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Today's new bookings
      Booking.find({ createdAt: { $gte: startOfToday, $lt: endOfToday } })
        .populate("user", "firstName lastName email phone")
        .populate("package", "title duration")
        .sort({ createdAt: -1 })
        .lean(),

      // Pending approvals
      Booking.find({ status: "pending" })
        .populate("user", "firstName lastName email phone")
        .populate("package", "title price duration")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),

      // Recent customers
      User.find({ role: "customer", isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("firstName lastName email phone createdAt")
        .lean(),

      // Pending cash payments to verify
      Payment.find({ paymentStatus: "pending", paymentMethod: "cash" })
        .populate("booking", "bookingNumber totalAmount")
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Recent payment transactions
      Payment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "firstName lastName")
        .populate("booking", "bookingNumber")
        .lean(),

      // Upcoming trips (travel date from today)
      Booking.find({
        status: "confirmed",
        travelDate: { $gte: startOfToday },
      })
        .sort({ travelDate: 1 })
        .limit(10)
        .populate("user", "firstName lastName email phone")
        .populate("package", "title duration")
        .lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          todayBookings,
          todayBookingsCount: todayBookings.length,
          pendingApprovals,
          pendingApprovalsCount: pendingApprovals.length,
          recentCustomers,
          pendingPayments,
          recentPayments,
          upcomingSchedule,
          overview: {
            totalBookings,
            totalCustomers,
            pendingApprovals: pendingApprovalsCount,
            pendingCashPayments: pendingCashPaymentsCount,
            pendingPayments: allPendingPaymentsCount,
            completedPayments: completedPaymentsCount,
            totalRevenue: totalRevenueData[0]?.total ?? 0,
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Staff dashboard error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
