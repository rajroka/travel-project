import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Booking } from "@/lib/db/models/Booking";
import { Payment } from "@/lib/db/models/Payment";
import { Favorite } from "@/lib/db/models/Favorite";
import { Notification } from "@/lib/db/models/Notification";
import { requireSession } from "@/lib/auth/session";
import mongoose from "mongoose";

// GET /api/dashboard/customer
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const now = new Date();

    const [
      upcomingTrips,
      bookingHistory,
      bookingStats,
      favoritesCount,
      unreadNotifications,
      paymentHistory,
      pendingPayments,
    ] = await Promise.all([
      // Upcoming confirmed trips
      Booking.find({
        user: session.userId,
        status: "confirmed",
        travelDate: { $gte: now },
      })
        .sort({ travelDate: 1 })
        .limit(5)
        .populate("package", "title coverImage duration price")
        .lean(),

      // Recent booking history
      Booking.find({ user: session.userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("package", "title coverImage price duration")
        .lean(),

      // Booking status counts — must use ObjectId in aggregation pipeline
      Booking.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(session.userId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Favorite.countDocuments({ user: session.userId }),

      Notification.countDocuments({ user: session.userId, isRead: false }),

      // Payment history
      Payment.find({ user: session.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("booking", "bookingNumber")
        .lean(),

      // Unpaid bookings
      Booking.find({ user: session.userId, paymentStatus: "unpaid", status: { $ne: "cancelled" } })
        .populate("package", "title price")
        .lean(),
    ]);

    // Build stats map
    const statsMap: Record<string, number> = {};
    for (const s of bookingStats) {
      statsMap[s._id as string] = s.count as number;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          upcomingTrips,
          bookingHistory,
          bookingStats: {
            pending: statsMap.pending ?? 0,
            confirmed: statsMap.confirmed ?? 0,
            completed: statsMap.completed ?? 0,
            cancelled: statsMap.cancelled ?? 0,
          },
          favoritesCount,
          unreadNotifications,
          paymentHistory,
          pendingPayments,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Customer dashboard error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
