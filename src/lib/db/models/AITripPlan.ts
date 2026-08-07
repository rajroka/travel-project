import mongoose, { Document, Schema } from "mongoose";

export interface IAITripPlan extends Document {
  user: mongoose.Types.ObjectId;
  input: {
    destination: string;
    days: number;
    budget: number;
    interests: string[];
    numberOfTravelers?: number;
  };
  generatedPlan: {
    recommendedPackages: mongoose.Types.ObjectId[];
    itinerary: Array<{
      day: number;
      title: string;
      activities: string[];
      restaurants?: string[];
      accommodation?: string;
      estimatedCost?: number;
    }>;
    packingChecklist?: string[];
    travelTips?: string[];
    totalEstimatedCost?: number;
    highlights?: string[];
  };
  isSaved: boolean;
  planName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AITripPlanSchema = new Schema<IAITripPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    input: {
      destination: { type: String, required: true },
      days: { type: Number, required: true },
      budget: { type: Number, required: true },
      interests: [{ type: String }],
      numberOfTravelers: { type: Number, default: 1 },
    },
    generatedPlan: {
      recommendedPackages: [{ type: Schema.Types.ObjectId, ref: "TourPackage" }],
      itinerary: [
        {
          day: Number,
          title: String,
          activities: [String],
          restaurants: [String],
          accommodation: String,
          estimatedCost: Number,
        },
      ],
      packingChecklist: [String],
      travelTips: [String],
      totalEstimatedCost: Number,
      highlights: [String],
    },
    isSaved: { type: Boolean, default: false },
    planName: { type: String },
  },
  { timestamps: true }
);

AITripPlanSchema.index({ user: 1, isSaved: 1 });

export const AITripPlan =
  mongoose.models.AITripPlan ||
  mongoose.model<IAITripPlan>("AITripPlan", AITripPlanSchema);
