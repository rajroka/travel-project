import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Favorite } from "@/lib/db/models/Favorite";
import { Destination } from "@/lib/db/models/Destination";
import { requireSession } from "@/lib/auth/session";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/favorites â€” list logged-in user's favorites
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 12);
    const { skip } = paginate(page, limit);

    const [favorites, total] = await Promise.all([
      Favorite.find({ user: session.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "destination",
          select: "name slug coverImage location averageRating isFeatured",
          match: { isActive: true },
        })
        .lean(),
      Favorite.countDocuments({ user: session.userId }),
    ]);

    // Filter out any populated docs that were null (inactive destinations)
    const validFavorites = favorites.filter((f) => f.destination !== null);

    return NextResponse.json(
      { success: true, data: { favorites: validFavorites, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/favorites â€” add a destination to favorites
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const { destinationId } = await req.json() as { destinationId: string };
    if (!destinationId) {
      return NextResponse.json(
        { success: false, message: "destinationId is required" },
        { status: 400 }
      );
    }

    const destination = await Destination.findOne({ _id: destinationId, isActive: true });
    if (!destination) {
      return NextResponse.json({ success: false, message: "Destination not found" }, { status: 404 });
    }

    // Upsert â€” silently succeed if already favorited
    const favorite = await Favorite.findOneAndUpdate(
      { user: session.userId, destination: destinationId },
      { user: session.userId, destination: destinationId },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { success: true, message: "Added to favorites", data: { favorite } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/favorites â€” remove a destination from favorites
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const { destinationId } = await req.json() as { destinationId: string };
    if (!destinationId) {
      return NextResponse.json(
        { success: false, message: "destinationId is required" },
        { status: 400 }
      );
    }

    await Favorite.findOneAndDelete({ user: session.userId, destination: destinationId });

    return NextResponse.json({ success: true, message: "Removed from favorites" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
