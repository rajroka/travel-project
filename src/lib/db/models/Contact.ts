import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  // Company contact info (singleton-like, one record)
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  mapEmbedUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  businessHours?: string;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    companyName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    mapEmbedUrl: { type: String },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      tiktok: String,
    },
    businessHours: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Contact =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
