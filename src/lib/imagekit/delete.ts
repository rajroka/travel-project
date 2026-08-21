import { imagekit } from "./upload";

/**
 * Delete a file from ImageKit by its fileId.
 * fileId is returned from uploadImage() and stored in the Gallery model.
 */
export async function deleteImage(fileId: string): Promise<void> {
  await imagekit.files.delete(fileId);
}
