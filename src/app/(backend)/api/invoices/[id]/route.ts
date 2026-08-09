import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Invoice } from "@/lib/db/models/Invoice";
import { requireSession } from "@/lib/auth/session";

// GET /api/invoices/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    await connectDB();
    const { id } = await params;

    const invoice = await Invoice.findById(id)
      .populate("payment", "paymentMethod transactionId paymentDate amount")
      .populate("booking", "bookingNumber travelDate numberOfTravelers")
      .populate("user", "firstName lastName email phone address");

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    // Customers can only see their own invoices
    if (session.role === "customer" && String((invoice.user as { _id: unknown })._id) !== session.userId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { invoice } }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
