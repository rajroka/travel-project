import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Destination } from "@/lib/db/models/Destination";
import { requireRole } from "@/lib/auth/session";
import { createDestinationSchema, destinationQuerySchema } from "@/lib/validations/destination";
import { slugify, paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/destinations â€” public, paginated list with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = destinationQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { page, limit, search, category, country, city, featured, sort } = parsed.data;
    const { skip } = paginate(page, limit);

    // Build filter
    const filter: Record<string, unknown> = { isActive: true };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (country) filter["location.country"] = { $regex: country, $options: "i" };
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (featured !== undefined) filter.isFeatured = featured;

    // Build sort
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      name: { name: 1 },
      rating: { averageRating: -1 },
      newest: { createdAt: -1 },
      popular: { totalReviews: -1 },
    };

    const [destinations, total] = await Promise.all([
      Destination.find(filter)
        .sort(sortMap[sort] ?? { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .lean(),
      Destination.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { destinations, pagination: paginationMeta(total, page, limit) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET destinations error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/destinations â€” staff/admin only
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, "staff", "admin");
    await connectDB();

    const body = await req.json();
    const parsed = createDestinationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const slug = slugify(parsed.data.name);
    const existing = await Destination.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const destination = await Destination.create({
      ...parsed.data,
      slug: finalSlug,
      createdBy: session.userId,
    });

    return NextResponse.json(
      { success: true, message: "Destination created", data: { destination } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("POST destination error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
