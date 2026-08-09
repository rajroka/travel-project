import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { AITripPlan } from "@/lib/db/models/AITripPlan";
import { requireSession } from "@/lib/auth/session";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/ai-planner/plans â€” alias for saved plans list
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);
    const { skip } = paginate(page, limit);

    const [plans, total] = await Promise.all([
      AITripPlan.find({ user: session.userId, isSaved: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("generatedPlan.recommendedPackages", "title slug coverImage price duration")
        .lean(),
      AITripPlan.countDocuments({ user: session.userId, isSaved: true }),
    ]);

    return NextResponse.json(
      { success: true, data: { plans, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
