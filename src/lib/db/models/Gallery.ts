import mongoose, { Document, Schema } from "mongoose";

export interface IGallery extends Document {
  title?: string;
  imageUrl: string;
  fileId: string;       // ImageKit fileId (used for deletion)
  filePath: string;     // ImageKit filePath (used for URL building)
  /** @deprecated use fileId — kept for backward compat if any docs still reference it */
  publicId?: string;
  category: "destination" | "package" | "general" | "banner";
  relatedId?: mongoose.Types.ObjectId;
  relatedModel?: "Destination" | "TourPackage";
  uploadedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String },
    imageUrl: { type: String, required: true },
    fileId: { type: String, required: true },
    filePath: { type: String, required: true },
    publicId: { type: String }, // kept for backward compat
    category: {
      type: String,
      enum: ["destination", "package", "general", "banner"],
      default: "general",
    },
    relatedId: { type: Schema.Types.ObjectId },
    relatedModel: { type: String, enum: ["Destination", "TourPackage"] },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Gallery =
  mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);
