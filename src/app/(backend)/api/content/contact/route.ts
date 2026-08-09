import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Contact } from "@/lib/db/models/Contact";
import { requireRole } from "@/lib/auth/session";
import { z } from "zod";

const contactSchema = z.object({
  companyName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  mapEmbedUrl: z.string().optional(),
  businessHours: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    youtube: z.string().url().optional(),
    tiktok: z.string().url().optional(),
  }).optional(),
});

// GET /api/content/contact â€” public
export async function GET() {
  try {
    await connectDB();
    const contact = await Contact.findOne().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: { contact } }, { status: 200 });
  } catch (error) {
    console.error("GET contact error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/content/contact â€” admin only (upsert)
export async function PUT(req: NextRequest) {
  try {
    const session = await requireRole(req, "admin");
    await connectDB();

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    // Replace or create the single contact document
    const existing = await Contact.findOne();
    let contact;
    if (existing) {
      contact = await Contact.findByIdAndUpdate(
        existing._id,
        { ...parsed.data, updatedBy: session.userId },
        { new: true }
      );
    } else {
      contact = await Contact.create({ ...parsed.data, updatedBy: session.userId });
    }

    return NextResponse.json(
      { success: true, message: "Contact info updated", data: { contact } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
