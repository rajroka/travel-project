import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { AITripPlan } from "@/lib/db/models/AITripPlan";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { requireSession } from "@/lib/auth/session";
import { generateItinerary } from "@/lib/ai/itinerary-generator";
import { paginate, paginationMeta } from "@/lib/utils/helpers";
import { z } from "zod";

const planInputSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  days: z.number().min(1).max(30),
  budget: z.number().min(1),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  numberOfTravelers: z.number().min(1).optional(),
});

// GET /api/ai-planner â€” list saved plans for current user
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

// POST /api/ai-planner â€” generate a new AI trip plan
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const body = await req.json();
    const parsed = planInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { destination, days, budget, interests, numberOfTravelers } = parsed.data;

    // Fetch active packages for this destination (search by name too)
    const packages = await TourPackage.find({
      isActive: true,
      $or: [
        { title: { $regex: destination, $options: "i" } },
      ],
    })
      .populate("destination", "name")
      .limit(20)
      .lean();

    // Also fetch packages by destination name
    const destPackages = await TourPackage.find({ isActive: true })
      .populate({ path: "destination", match: { name: { $regex: destination, $options: "i" } }, select: "name" })
      .limit(20)
      .lean();

    const allPackages = [...packages, ...destPackages.filter((p) => p.destination !== null)];
    const uniquePackages = Array.from(new Map(allPackages.map((p) => [String(p._id), p])).values());

    if (uniquePackages.length === 0) {
      return NextResponse.json(
        { success: false, message: "No packages found for this destination" },
        { status: 404 }
      );
    }

    const packagesForAI = uniquePackages.map((p) => ({
      id: String(p._id),
      title: p.title,
      price: p.discountPrice ?? p.price,
      duration: p.duration,
      highlights: p.highlights,
      includedServices: p.includedServices,
    }));

    const generatedPlan = await generateItinerary({
      destination,
      days,
      budget,
      interests,
      numberOfTravelers,
      availablePackages: packagesForAI,
    });

    const isSave = body.save === true;
    const planName = body.planName as string | undefined;

    // Validate the AI-returned package IDs against the actual DB
    // The AI may hallucinate IDs or return non-existent ones
    const validPackageIds = generatedPlan.recommendedPackageIds.filter((id) =>
      packagesForAI.some((p) => p.id === id)
    );

    const plan = await AITripPlan.create({
      user: session.userId,
      input: { destination, days, budget, interests, numberOfTravelers },
      generatedPlan: {
        ...generatedPlan,
        recommendedPackages: validPackageIds,
      },
      isSaved: isSave,
      planName,
    });

    return NextResponse.json(
      { success: true, message: "Trip plan generated", data: { plan } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("AI planner error:", err);
    return NextResponse.json({ success: false, message: "Failed to generate trip plan" }, { status: 500 });
  }
}
