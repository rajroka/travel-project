import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/session";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/users â€” admin: list all users with filters
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin", "staff");
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const role = req.nextUrl.searchParams.get("role");
    const search = req.nextUrl.searchParams.get("search");
    const active = req.nextUrl.searchParams.get("active");
    const { skip } = paginate(page, limit);

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (active !== null && active !== undefined) filter.isActive = active === "true";
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password -emailVerificationToken -passwordResetToken")
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json(
      { success: true, data: { users, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
