import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { Booking } from "@/lib/db/models/Booking";
import { Notification } from "@/lib/db/models/Notification";
import { requireRole } from "@/lib/auth/session";
import { refundSchema } from "@/lib/validations/payment";
import { createRefund } from "@/lib/payments/stripe";

// POST /api/payments/:id/refund — staff/admin issue a refund
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const parsed = refundSchema.safeParse({ paymentId: id, ...body });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { refundAmount, refundReason } = parsed.data;

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    if (payment.paymentStatus !== "paid") {
      return NextResponse.json(
        { success: false, message: "Only paid payments can be refunded" },
        { status: 400 }
      );
    }

    if (refundAmount > payment.amount) {
      return NextResponse.json(
        { success: false, message: "Refund amount cannot exceed payment amount" },
        { status: 400 }
      );
    }

    // For Stripe, call the Stripe refund API
    if (payment.paymentMethod === "stripe" && payment.transactionId) {
      await createRefund(payment.transactionId, refundAmount);
    }

    const updated = await Payment.findByIdAndUpdate(
      id,
      {
        paymentStatus: "refunded",
        refundAmount,
        refundReason,
        refundedAt: new Date(),
        verifiedBy: session.userId,
      },
      { new: true }
    );

    await Booking.findByIdAndUpdate(payment.booking, {
      paymentStatus: "refunded",
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: `Refund issued: ${refundReason}`,
    });

    await Notification.create({
      user: payment.user,
      type: "general",
      title: "Refund Processed",
      message: `A refund of $${refundAmount} has been processed. Reason: ${refundReason}`,
      relatedId: payment._id,
      relatedModel: "Payment",
    });

    return NextResponse.json(
      { success: true, message: "Refund processed successfully", data: { payment: updated } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Refund error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
