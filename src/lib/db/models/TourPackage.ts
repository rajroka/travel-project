import mongoose, { Document, Schema } from "mongoose";

export interface IItineraryDay {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  accommodation?: string;
  meals?: string[];
}

export interface ITourPackage extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  destination: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  images: string[];
  coverImage?: string;
  price: number;
  discountPrice?: number;
  duration: {
    days: number;
    nights: number;
  };
  maxTravelers: number;
  minTravelers?: number;
  itinerary: IItineraryDay[];
  includedServices: string[];
  excludedServices?: string[];
  highlights?: string[];
  requirements?: string[];
  difficultyLevel?: "easy" | "moderate" | "challenging";
  isActive: boolean;
  isPromotional: boolean;
  promotionExpiry?: Date;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ItineraryDaySchema = new Schema<IItineraryDay>(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    activities: [String],
    accommodation: String,
    meals: [String],
  },
  { _id: false }
);

const TourPackageSchema = new Schema<ITourPackage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    images: [{ type: String }],
    coverImage: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    duration: {
      days: { type: Number, required: true },
      nights: { type: Number, required: true },
    },
    maxTravelers: { type: Number, required: true },
    minTravelers: { type: Number, default: 1 },
    itinerary: [ItineraryDaySchema],
    includedServices: [{ type: String }],
    excludedServices: [{ type: String }],
    highlights: [{ type: String }],
    requirements: [{ type: String }],
    difficultyLevel: {
      type: String,
      enum: ["easy", "moderate", "challenging"],
      default: "easy",
    },
    isActive: { type: Boolean, default: true },
    isPromotional: { type: Boolean, default: false },
    promotionExpiry: { type: Date },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

TourPackageSchema.index({ title: "text", description: "text" });
TourPackageSchema.index({ destination: 1, isActive: 1 });
TourPackageSchema.index({ price: 1 });
TourPackageSchema.index({ isPromotional: 1, isActive: 1 });

export const TourPackage =
  mongoose.models.TourPackage ||
  mongoose.model<ITourPackage>("TourPackage", TourPackageSchema);
