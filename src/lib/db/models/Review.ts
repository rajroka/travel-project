import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  package?: mongoose.Types.ObjectId;
  destination?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
  isHidden: boolean;
  isVerified: boolean;
  adminResponse?: {
    comment: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user:        { type: Schema.Types.ObjectId, ref: "User", required: true },
    package:     { type: Schema.Types.ObjectId, ref: "TourPackage" },
    destination: { type: Schema.Types.ObjectId, ref: "Destination" },
    booking:     { type: Schema.Types.ObjectId, ref: "Booking" },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    title:       { type: String, trim: true },
    comment:     { type: String, required: true },
    photos:      [{ type: String }],
    isHidden:    { type: Boolean, default: false },
    isVerified:  { type: Boolean, default: false },
    adminResponse: {
      comment: String,
      respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
      respondedAt: Date,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ package: 1, isHidden: 1 });
ReviewSchema.index({ destination: 1, isHidden: 1 });
ReviewSchema.index({ user: 1, destination: 1 });

export const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
