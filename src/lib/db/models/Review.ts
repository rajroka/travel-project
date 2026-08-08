import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  package: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
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
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    package: { type: Schema.Types.ObjectId, ref: "TourPackage", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true },
    photos: [{ type: String }],
    isHidden: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    adminResponse: {
      comment: String,
      respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
      respondedAt: Date,
    },
  },
  { timestamps: true }
);

// One review per booking
ReviewSchema.index({ booking: 1, user: 1 }, { unique: true });
ReviewSchema.index({ package: 1, isHidden: 1 });

export const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
