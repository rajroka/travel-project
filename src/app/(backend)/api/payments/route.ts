import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { requireSession } from "@/lib/auth/session";
import { resolveMongoUser } from "@/lib/auth/resolve-user";
import { paymentQuerySchema } from "@/lib/validations/payment";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/payments â€” customer sees own; staff/admin sees all
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = paymentQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { page, limit, status, method, startDate, endDate } = parsed.data;
    const { skip } = paginate(page, limit);

    const filter: Record<string, unknown> = {};
    if (session.role === "customer") {
      const mongoUser = await resolveMongoUser(session);
      filter.user = mongoUser._id;
    }
    if (status) filter.paymentStatus = status;
    if (method) filter.paymentMethod = method;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (filter.createdAt as Record<string, Date>).$lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("booking", "bookingNumber travelDate totalAmount")
        .populate("user", "firstName lastName email")
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return NextResponse.json(
      { success: true, data: { payments, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/payments — create a cash/offline payment record
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const { bookingId, amount, paymentMethod } = await req.json() as {
      bookingId: string;
      amount: number;
      paymentMethod: string;
    };

    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json({ success: false, message: "bookingId, amount and paymentMethod are required" }, { status: 400 });
    }

    const payment = await Payment.create({
      booking: bookingId,
      user: session.userId,
      amount,
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
    });

    return NextResponse.json({ success: true, data: { payment } }, { status: 201 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
