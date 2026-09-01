import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Review } from "@/lib/db/models/Review";
import { Booking } from "@/lib/db/models/Booking";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { Notification } from "@/lib/db/models/Notification";
import { requireSession } from "@/lib/auth/session";
import { createReviewSchema, reviewQuerySchema } from "@/lib/validations/review";
import { paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/reviews â€” public, filtered list
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = reviewQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { page, limit, packageId, destinationId, hidden, minRating, maxRating, sort } = parsed.data;
    const { skip } = paginate(page, limit);

    const filter: Record<string, unknown> = {};
    if (hidden === undefined) filter.isHidden = false;
    else filter.isHidden = hidden;
    if (packageId) filter.package = packageId;
    if (destinationId) filter.destination = destinationId;
    if (minRating !== undefined || maxRating !== undefined) {
      filter.rating = {};
      if (minRating !== undefined) (filter.rating as Record<string, number>).$gte = minRating;
      if (maxRating !== undefined) (filter.rating as Record<string, number>).$lte = maxRating;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      rating_high: { rating: -1 },
      rating_low: { rating: 1 },
    };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sortMap[sort] ?? { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "firstName lastName avatar")
        .populate("package", "title slug")
        .lean(),
      Review.countDocuments(filter),
    ]);

    return NextResponse.json(
      { success: true, data: { reviews, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET reviews error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/reviews â€” authenticated customer, one per completed booking
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { bookingId, packageId, destinationId, rating, title, comment, photos } = parsed.data;

    // Destination review — no booking required
    if (destinationId && !packageId && !bookingId) {
      const { resolveMongoUser } = await import("@/lib/auth/resolve-user");
      const mongoUser = await resolveMongoUser(session);

      // One review per user per destination
      const existing = await Review.findOne({ destination: destinationId, user: mongoUser._id });
      if (existing) {
        return NextResponse.json({ success: false, message: "You have already reviewed this destination" }, { status: 409 });
      }

      const review = await Review.create({
        user: mongoUser._id,
        destination: destinationId,
        rating, title, comment, photos,
        isVerified: false,
      });

      const populated = await review.populate("user", "firstName lastName");

      // Update destination rating
      const { Destination } = await import("@/lib/db/models/Destination");
      const stats = await Review.aggregate([
        { $match: { destination: review.destination, isHidden: false } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      if (stats.length > 0) {
        await Destination.findByIdAndUpdate(destinationId, {
          averageRating: Math.round(stats[0].avgRating * 10) / 10,
          totalReviews: stats[0].count,
        });
      }

      return NextResponse.json({ success: true, message: "Review submitted", data: { review: populated } }, { status: 201 });
    }

    // Package / booking review — requires completed booking
    const { resolveMongoUser } = await import("@/lib/auth/resolve-user");
    const mongoUser = await resolveMongoUser(session);

    // Verify booking belongs to user and is completed
    const booking = await Booking.findOne({
      _id: bookingId,
      user: mongoUser._id,
      status: "completed",
    });
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "You can only review completed bookings" },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await Review.findOne({ booking: bookingId, user: mongoUser._id });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this booking" },
        { status: 409 }
      );
    }

    const review = await Review.create({
      user: mongoUser._id,
      package: packageId,
      booking: bookingId,
      rating, title, comment, photos,
      isVerified: true,
    });

    // Recalculate package average rating
    const stats = await Review.aggregate([
      { $match: { package: review.package, isHidden: false } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await TourPackage.findByIdAndUpdate(packageId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].count,
      });
    }

    return NextResponse.json(
      { success: true, message: "Review submitted", data: { review } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("POST review error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
