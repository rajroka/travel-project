import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { AITripPlan } from "@/lib/db/models/AITripPlan";
import { requireSession } from "@/lib/auth/session";

// GET /api/ai-planner/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    await connectDB();
    const { id } = await params;

    const plan = await AITripPlan.findOne({ _id: id, user: session.userId })
      .populate("generatedPlan.recommendedPackages", "title slug coverImage price duration");

    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { plan } }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/ai-planner/:id — save or rename a plan
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    await connectDB();
    const { id } = await params;

    const { isSaved, planName } = await req.json() as { isSaved?: boolean; planName?: string };

    const plan = await AITripPlan.findOneAndUpdate(
      { _id: id, user: session.userId },
      { ...(isSaved !== undefined && { isSaved }), ...(planName && { planName }) },
      { new: true }
    );

    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Plan updated", data: { plan } }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/ai-planner/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    await connectDB();
    const { id } = await params;

    const plan = await AITripPlan.findOneAndDelete({ _id: id, user: session.userId });
    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Plan deleted" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
