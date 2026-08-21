import ImageKit from "@imagekit/nodejs";

const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT as string;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY as string;

if (!IMAGEKIT_PRIVATE_KEY) {
  throw new Error("Please define IMAGEKIT_PRIVATE_KEY in .env.local");
}

export const imagekit = new ImageKit({
  privateKey: IMAGEKIT_PRIVATE_KEY,
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
 * @param file   - Buffer, File, fetch Response, or base64 data URI string
 * @param fileName - Original file name (used in ImageKit)
 * @param folder  - ImageKit folder path, e.g. "travel-project/destinations"
 */
export async function uploadImage(
  file: File | Buffer | string,
  fileName: string,
  folder = "travel-project"
): Promise<UploadResult> {
  const result = await imagekit.files.upload({
    file: file as File,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    filePath: result.filePath,
    width: result.width ?? undefined,
    height: result.height ?? undefined,
    size: result.size,
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
  const urlEndpoint = IMAGEKIT_URL_ENDPOINT ?? "https://ik.imagekit.io/ankckbeex/travel-project";

  if (!options) return `${urlEndpoint}${filePath}`;

  const tr: string[] = [];
  if (options.width) tr.push(`w-${options.width}`);
  if (options.height) tr.push(`h-${options.height}`);
  if (options.quality) tr.push(`q-${options.quality}`);
  if (options.format) tr.push(`f-${options.format}`);

  return `${urlEndpoint}${filePath}${tr.length ? `?tr=${tr.join(",")}` : ""}`;
}
