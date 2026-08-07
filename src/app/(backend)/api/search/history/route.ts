import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SearchHistory } from "@/lib/db/models/SearchHistory";
import { requireSession } from "@/lib/auth/session";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/search/history â€” logged-in user's search history
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const { skip } = paginate(page, limit);

    const [history, total] = await Promise.all([
      SearchHistory.find({ user: session.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("query searchType createdAt resultsCount")
        .lean(),
      SearchHistory.countDocuments({ user: session.userId }),
    ]);

    return NextResponse.json(
      { success: true, data: { history, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/search/history â€” clear user's search history
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    await SearchHistory.deleteMany({ user: session.userId });

    return NextResponse.json({ success: true, message: "Search history cleared" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
