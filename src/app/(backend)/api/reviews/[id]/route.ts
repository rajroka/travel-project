import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Review } from "@/lib/db/models/Review";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { Notification } from "@/lib/db/models/Notification";
import { requireRole } from "@/lib/auth/session";
import { respondReviewSchema } from "@/lib/validations/review";

// PATCH /api/reviews/:id — staff/admin: respond, hide, or show a review
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(req, "staff", "admin");
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const { action } = body as { action: "respond" | "hide" | "show" };

    if (action === "hide" || action === "show") {
      const review = await Review.findByIdAndUpdate(
        id,
        { isHidden: action === "hide" },
        { new: true }
      );
      if (!review) {
        return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
      }

      // Recalculate package average rating
      const stats = await Review.aggregate([
        { $match: { package: review.package, isHidden: false } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      await TourPackage.findByIdAndUpdate(review.package, {
        averageRating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
        totalReviews: stats.length > 0 ? stats[0].count : 0,
      });

      return NextResponse.json(
        { success: true, message: `Review ${action === "hide" ? "hidden" : "restored"}`, data: { review } },
        { status: 200 }
      );
    }

    if (action === "respond") {
      const parsed = respondReviewSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
          { status: 422 }
        );
      }

      const review = await Review.findByIdAndUpdate(
        id,
        {
          adminResponse: {
            comment: parsed.data.comment,
            respondedBy: session.userId,
            respondedAt: new Date(),
          },
        },
        { new: true }
      ).populate("user", "_id");

      if (!review) {
        return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
      }

      await Notification.create({
        user: (review.user as { _id: unknown })._id,
        type: "review_response",
        title: "Response to Your Review",
        message: "A staff member has responded to your review.",
        relatedId: review._id,
        relatedModel: "Review",
      });

      return NextResponse.json(
        { success: true, message: "Response added", data: { review } },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: false, message: "Invalid action. Use 'respond', 'hide', or 'show'." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("PATCH review error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
