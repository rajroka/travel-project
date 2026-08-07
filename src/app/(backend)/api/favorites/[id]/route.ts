import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Favorite } from "@/lib/db/models/Favorite";
import { requireSession } from "@/lib/auth/session";

// DELETE /api/favorites/:id — remove a specific favorite by its document _id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    await connectDB();
    const { id } = await params;

    const favorite = await Favorite.findOneAndDelete({ _id: id, user: session.userId });
    if (!favorite) {
      return NextResponse.json({ success: false, message: "Favorite not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Removed from favorites" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
