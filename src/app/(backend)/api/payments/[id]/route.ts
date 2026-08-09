import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { Booking } from "@/lib/db/models/Booking";
import { Notification } from "@/lib/db/models/Notification";
import { Invoice } from "@/lib/db/models/Invoice";
import { requireSession, requireRole } from "@/lib/auth/session";
import { refundSchema, cashPaymentSchema } from "@/lib/validations/payment";
import { createRefund } from "@/lib/payments/stripe";
import { generateInvoiceNumber } from "@/lib/auth/auth";

// GET /api/payments/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    await connectDB();
    const { id } = await params;

    const payment = await Payment.findById(id)
      .populate("booking", "bookingNumber travelDate totalAmount status")
      .populate("user", "firstName lastName email")
      .lean();

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    if (session.role === "customer" && String((payment.user as { _id: unknown })?._id ?? payment.user) !== session.userId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { payment } }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/payments/:id — staff: verify cash payment or issue refund
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const { action } = body as { action: string };

    if (action === "verify_cash") {
      const parsed = cashPaymentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
          { status: 422 }
        );
      }

      const payment = await Payment.findByIdAndUpdate(
        id,
        {
          paymentStatus: "paid",
          paymentDate: new Date(),
          verifiedBy: session.userId,
          notes: parsed.data.notes,
        },
        { new: true }
      );

      if (!payment) {
        return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
      }

      await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "paid" });

      const invoiceNumber = generateInvoiceNumber();
      const invoice = await Invoice.create({
        payment: payment._id,
        booking: payment.booking,
        user: payment.user,
        invoiceNumber,
        totalAmount: payment.amount,
        subtotal: payment.amount,
        tax: 0,
        discount: 0,
        items: [{ description: "Tour Package Booking (Cash)", quantity: 1, unitPrice: payment.amount, total: payment.amount }],
        status: "paid",
      });

      await Notification.create({
        user: payment.user,
        type: "payment_received",
        title: "Cash Payment Verified",
        message: `Your cash payment of $${payment.amount} has been verified.`,
        relatedId: payment._id,
        relatedModel: "Payment",
      });

      return NextResponse.json(
        { success: true, message: "Cash payment verified", data: { payment, invoice } },
        { status: 200 }
      );
    }

    if (action === "refund") {
      const parsed = refundSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
          { status: 422 }
        );
      }

      const payment = await Payment.findById(id);
      if (!payment) {
        return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
      }

      if (payment.paymentMethod === "stripe" && payment.transactionId) {
        await createRefund(payment.transactionId, parsed.data.refundAmount);
      }

      const updated = await Payment.findByIdAndUpdate(
        id,
        {
          paymentStatus: "refunded",
          refundAmount: parsed.data.refundAmount,
          refundReason: parsed.data.refundReason,
          refundedAt: new Date(),
        },
        { new: true }
      );

      await Booking.findByIdAndUpdate(payment.booking, {
        paymentStatus: "refunded",
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: parsed.data.refundReason,
      });

      await Notification.create({
        user: payment.user,
        type: "general",
        title: "Refund Processed",
        message: `A refund of $${parsed.data.refundAmount} has been processed. Reason: ${parsed.data.refundReason}`,
        relatedId: payment._id,
        relatedModel: "Payment",
      });

      return NextResponse.json(
        { success: true, message: "Refund processed", data: { payment: updated } },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: false, message: "Invalid action. Use 'verify_cash' or 'refund'." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("PATCH payment error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
