import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Booking } from "@/lib/db/models/Booking";
import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/session";
import { updateBookingStatusSchema } from "@/lib/validations/booking";
import { sendMail, bookingStatusTemplate } from "@/lib/email/mailer";

// PATCH /api/bookings/:id/status — staff/admin shorthand status update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateBookingStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { status, cancelReason } = parsed.data;

    const updateData: Record<string, unknown> = { status };
    if (status === "confirmed") {
      updateData.approvedBy = session.userId;
      updateData.approvedAt = new Date();
    }
    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
      if (cancelReason) updateData.cancelReason = cancelReason;
    }
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const booking = await Booking.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate("user", "firstName lastName email");

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const notifType =
      status === "confirmed" ? "booking_approved" :
      status === "cancelled" ? "booking_cancelled" : "general";

    await Notification.create({
      user: (booking.user as { _id: unknown })._id,
      type: notifType,
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your booking ${booking.bookingNumber} status is now: ${status}.${cancelReason ? " Reason: " + cancelReason : ""}`,
      link: `/bookings/${booking._id}`,
      relatedId: booking._id,
      relatedModel: "Booking",
    });

    const userDoc = await User.findById((booking.user as { _id: unknown })._id);
    if (userDoc) {
      sendMail({
        to: userDoc.email,
        subject: `Booking ${status} - ${booking.bookingNumber}`,
        html: bookingStatusTemplate(userDoc.firstName, booking.bookingNumber, status, cancelReason),
        userId: String(userDoc._id),
        templateType: "booking_status",
      }).catch(console.error);
    }

    return NextResponse.json(
      { success: true, message: `Booking status updated to ${status}`, data: { booking } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
