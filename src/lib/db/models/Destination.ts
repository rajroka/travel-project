import mongoose, { Document, Schema } from "mongoose";

export interface IDestination extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  coverImage?: string;
  category: mongoose.Types.ObjectId;
  location: {
    address?: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  bestSeason?: string[];
  highlights?: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema = new Schema<IDestination>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    images: [{ type: String }],
    coverImage: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    location: {
      address: String,
      city: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    bestSeason: [{ type: String }],
    highlights: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

DestinationSchema.index({ name: "text", description: "text" });
DestinationSchema.index({ "location.city": 1, "location.country": 1 });
DestinationSchema.index({ isFeatured: 1, isActive: 1 });

export const Destination =
  mongoose.models.Destination ||
  mongoose.model<IDestination>("Destination", DestinationSchema);
