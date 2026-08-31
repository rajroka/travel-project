import ImageKit from "@imagekit/nodejs";
import { randomUUID } from "crypto";

export const IMAGEKIT_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string;

// v7 SDK only needs privateKey — reads IMAGEKIT_PRIVATE_KEY from env automatically
export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export interface UploadResult {
  url: string;
  fileId: string;
  name: string;
  filePath: string;
  width?: number;
  height?: number;
  size?: number;
}

/**
 * Upload a file to ImageKit.
 *
 * The v7 SDK `file` field accepts: File | Response | FsReadStream | string (URL/base64).
 * We receive a Buffer from the route handler, so we wrap it in a native File object.
 *
 * @param buffer    Raw bytes of the uploaded file
 * @param fileName  Original file name (extension used for mime type)
 * @param mimeType  MIME type of the file, e.g. "image/jpeg"
 * @param folder    ImageKit folder path, e.g. "travel-project/destinations"
 */
export async function uploadImage(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder = "travel-project"
): Promise<UploadResult> {
  // Make the file name unique by prepending a UUID prefix
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  const uniqueName = `${randomUUID()}${ext}`;

  // Wrap Buffer in a native File — v7 SDK requires Uploadable (File/Response/Stream)
  const blob = new Blob([buffer], { type: mimeType });
  const file = new File([blob], uniqueName, { type: mimeType });

  const result = await imagekit.files.upload({
    file,
    fileName: uniqueName,
    folder,
  });

  return {
    url: result.url ?? "",
    fileId: result.fileId ?? "",
    name: result.name ?? uniqueName,
    filePath: result.filePath ?? "",
    width: result.width ?? undefined,
    height: result.height ?? undefined,
    size: result.size ?? undefined,
  };
}

/**
 * Build an optimized ImageKit URL with optional transformations.
 */
export function buildImageUrl(
  filePath: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpg" | "png" | "avif";
  }
): string {
  const endpoint =
    IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/congentgenerator";
  if (!options) return `${endpoint}${filePath}`;

  const tr: string[] = [];
  if (options.width) tr.push(`w-${options.width}`);
  if (options.height) tr.push(`h-${options.height}`);
  if (options.quality) tr.push(`q-${options.quality}`);
  if (options.format) tr.push(`f-${options.format}`);

  return `${endpoint}${filePath}${tr.length ? `?tr=${tr.join(",")}` : ""}`;
}
