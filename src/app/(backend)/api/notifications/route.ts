import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Notification } from "@/lib/db/models/Notification";
import { requireSession, requireRole } from "@/lib/auth/session";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/notifications â€” list notifications for current user
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";
    const { skip } = paginate(page, limit);

    const filter: Record<string, unknown> = { user: session.userId };
    if (unreadOnly) filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: session.userId, isRead: false }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { notifications, unreadCount, pagination: paginationMeta(total, page, limit) },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/notifications â€” mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const { ids } = await req.json() as { ids?: string[] };

    const filter: Record<string, unknown> = { user: session.userId };
    if (ids?.length) filter._id = { $in: ids };

    await Notification.updateMany(filter, { isRead: true });

    return NextResponse.json(
      { success: true, message: "Notifications marked as read" },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/notifications â€” admin broadcast notification to all or specific users
export async function POST(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const { userIds, title, message, type, link } = await req.json() as {
      userIds?: string[];
      title: string;
      message: string;
      type: string;
      link?: string;
    };

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "title and message are required" },
        { status: 400 }
      );
    }

    const { User } = await import("@/lib/db/models/User");
    const targetUsers = userIds?.length
      ? userIds
      : (await User.find({ isActive: true }).distinct("_id")).map(String);

    const notifications = targetUsers.map((userId) => ({
      user: userId,
      type: type || "general",
      title,
      message,
      link,
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json(
      { success: true, message: `Notification sent to ${targetUsers.length} users` },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
