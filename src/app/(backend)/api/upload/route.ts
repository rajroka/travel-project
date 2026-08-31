import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { uploadImage } from "@/lib/imagekit/upload";
import { deleteImage } from "@/lib/imagekit/delete";
import { Gallery } from "@/lib/db/models/Gallery";
import { connectDB } from "@/lib/db/connection";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_SIZE_MB = 10;

// POST /api/upload — upload one image to ImageKit
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
        { success: false, message: "Invalid file type. Only JPEG, PNG, WebP, GIF, and AVIF are allowed." },
        { status: 422 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: `File too large. Maximum size is ${MAX_SIZE_MB}MB.` },
        { status: 422 }
      );
    }

    const ikFolder = `travel-project/${folder}`;

    // Map folder names to Gallery category enum values
    const categoryMap: Record<string, string> = {
      destinations: "destination",
      destination: "destination",
      packages: "package",
      package: "package",
      banner: "banner",
    };
    const galleryCategory = categoryMap[folder] ?? "general";

    // Convert browser File → Buffer, pass mimeType so uploadImage can wrap it correctly
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImage(buffer, file.name, file.type, ikFolder);

    // Save to gallery
    const galleryEntry = await Gallery.create({
      title: title ?? file.name,
      imageUrl: result.url,
      fileId: result.fileId,
      filePath: result.filePath,
      category: galleryCategory,
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
          fileId: result.fileId,
          filePath: result.filePath,
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

// DELETE /api/upload — delete an image from ImageKit + gallery
export async function DELETE(req: NextRequest) {
  try {
    await requireSession(req);
    await connectDB();

    const { fileId, galleryId } = await req.json() as { fileId?: string; galleryId?: string };

    if (!fileId) {
      return NextResponse.json({ success: false, message: "fileId is required" }, { status: 400 });
    }

    await deleteImage(fileId);

    if (galleryId) {
      await Gallery.findByIdAndDelete(galleryId);
    } else {
      await Gallery.findOneAndDelete({ fileId });
    }

    return NextResponse.json({ success: true, message: "Image deleted" }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}
