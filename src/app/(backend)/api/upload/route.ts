import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { uploadImage } from "@/lib/cloudinary/upload";
import { deleteImage } from "@/lib/cloudinary/delete";
import { Gallery } from "@/lib/db/models/Gallery";
import { connectDB } from "@/lib/db/connection";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;

// POST /api/upload â€” upload one image to Cloudinary
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "general";
    const category = (formData.get("category") as string) ?? "general";
    const relatedId = formData.get("relatedId") as string | null;
    const relatedModel = formData.get("relatedModel") as string | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 422 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: `File too large. Maximum size is ${MAX_SIZE_MB}MB.` },
        { status: 422 }
      );
    }

    // Convert to base64 data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await uploadImage(base64, `travel-project/${folder}`);

    // Save to gallery
    const galleryEntry = await Gallery.create({
      title: title ?? file.name,
      imageUrl: result.url,
      publicId: result.publicId,
      category,
      relatedId: relatedId ?? undefined,
      relatedModel: relatedModel ?? undefined,
      uploadedBy: session.userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          galleryId: galleryEntry._id,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}

// DELETE /api/upload â€” delete an image from Cloudinary + gallery
export async function DELETE(req: NextRequest) {
  try {
    await requireSession(req);
    await connectDB();

    const { publicId, galleryId } = await req.json() as { publicId?: string; galleryId?: string };

    if (!publicId) {
      return NextResponse.json({ success: false, message: "publicId is required" }, { status: 400 });
    }

    await deleteImage(publicId);

    if (galleryId) {
      await Gallery.findByIdAndDelete(galleryId);
    } else {
      await Gallery.findOneAndDelete({ publicId });
    }

    return NextResponse.json({ success: true, message: "Image deleted" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}
