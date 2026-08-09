import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Upload a file buffer or base64 string to Cloudinary.
 * @param file  - base64 data URI or remote URL
 * @param folder - Cloudinary folder (e.g. "destinations", "packages")
 */
export async function uploadImage(
  file: string,
  folder = "travel-project"
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export { cloudinary };
