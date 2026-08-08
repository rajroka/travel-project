import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/auth";
import { z } from "zod";

const createStaffSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

// GET /api/staff â€” admin: list all staff
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      User.find({ role: "staff" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password -emailVerificationToken -passwordResetToken")
        .lean(),
      User.countDocuments({ role: "staff" }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          staff,
          pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/staff â€” admin: create staff account
export async function POST(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const body = await req.json();
    const parsed = createStaffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { firstName, lastName, email, password, phone } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPw = await hashPassword(password);
    const staff = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPw,
      phone,
      role: "staff",
      isEmailVerified: true, // Admin-created accounts skip verification
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff account created",
        data: {
          staff: {
            id: staff._id,
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            role: staff.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
