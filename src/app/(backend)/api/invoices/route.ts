import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Invoice } from "@/lib/db/models/Invoice";
import { requireSession, requireRole } from "@/lib/auth/session";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/invoices â€” customer sees own; staff/admin sees all
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);
    const { skip } = paginate(page, limit);

    const filter: Record<string, unknown> = {};
    if (session.role === "customer") filter.user = session.userId;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("payment", "paymentMethod transactionId paymentDate")
        .populate("booking", "bookingNumber travelDate")
        .populate("user", "firstName lastName email")
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    return NextResponse.json(
      { success: true, data: { invoices, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
