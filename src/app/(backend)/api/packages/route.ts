import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { requireRole } from "@/lib/auth/session";
import { createPackageSchema, packageQuerySchema } from "@/lib/validations/package";
import { slugify, paginate, paginationMeta } from "@/lib/utils/helpers";

// GET /api/packages â€” public, paginated + filtered
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = packageQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { page, limit, search, destination, category, minPrice, maxPrice, minDays, maxDays, difficulty, promotional, active, sort } = parsed.data;
    const { skip } = paginate(page, limit);

    const filter: Record<string, unknown> = { isActive: active !== false };
    if (search) filter.$text = { $search: search };
    if (destination) filter.destination = destination;
    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) (filter.price as Record<string, number>).$gte = minPrice;
      if (maxPrice !== undefined) (filter.price as Record<string, number>).$lte = maxPrice;
    }
    if (minDays !== undefined || maxDays !== undefined) {
      filter["duration.days"] = {};
      if (minDays !== undefined) (filter["duration.days"] as Record<string, number>).$gte = minDays;
      if (maxDays !== undefined) (filter["duration.days"] as Record<string, number>).$lte = maxDays;
    }
    if (difficulty) filter.difficultyLevel = difficulty;
    if (promotional) filter.isPromotional = true;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { averageRating: -1 },
      newest: { createdAt: -1 },
      popular: { totalBookings: -1 },
    };

    const [packages, total] = await Promise.all([
      TourPackage.find(filter)
        .sort(sortMap[sort] ?? { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("destination", "name slug location")
        .populate("category", "name slug")
        .lean(),
      TourPackage.countDocuments(filter),
    ]);

    return NextResponse.json(
      { success: true, data: { packages, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET packages error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/packages â€” staff/admin only
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, "staff", "admin");
    await connectDB();

    const body = await req.json();
    const parsed = createPackageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const slug = slugify(parsed.data.title);
    const existing = await TourPackage.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const pkg = await TourPackage.create({
      ...parsed.data,
      slug: finalSlug,
      createdBy: session.userId,
    });

    return NextResponse.json(
      { success: true, message: "Package created", data: { package: pkg } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("POST package error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
