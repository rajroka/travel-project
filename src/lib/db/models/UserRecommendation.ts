import mongoose, { Document, Schema } from "mongoose";

export interface IUserRecommendation extends Document {
  user: mongoose.Types.ObjectId;
  packages: mongoose.Types.ObjectId[];
  destinations: mongoose.Types.ObjectId[];
  basedOn: "search_history" | "booking_history" | "favorites" | "ai";
  score?: number;
  notificationSent: boolean;
  notificationSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserRecommendationSchema = new Schema<IUserRecommendation>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    packages: [{ type: Schema.Types.ObjectId, ref: "TourPackage" }],
    destinations: [{ type: Schema.Types.ObjectId, ref: "Destination" }],
    basedOn: {
      type: String,
      enum: ["search_history", "booking_history", "favorites", "ai"],
      required: true,
    },
    score: { type: Number },
    notificationSent: { type: Boolean, default: false },
    notificationSentAt: { type: Date },
  },
  { timestamps: true }
);

UserRecommendationSchema.index({ user: 1, createdAt: -1 });

export const UserRecommendation =
  mongoose.models.UserRecommendation ||
  mongoose.model<IUserRecommendation>("UserRecommendation", UserRecommendationSchema);
