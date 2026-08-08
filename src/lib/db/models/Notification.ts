import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type:
    | "booking_confirmed"
    | "booking_cancelled"
    | "booking_approved"
    | "trip_reminder"
    | "new_package"
    | "promotion"
    | "payment_received"
    | "review_response"
    | "general";
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  relatedId?: mongoose.Types.ObjectId;
  relatedModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "booking_confirmed",
        "booking_cancelled",
        "booking_approved",
        "trip_reminder",
        "new_package",
        "promotion",
        "payment_received",
        "review_response",
        "general",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    relatedId: { type: Schema.Types.ObjectId },
    relatedModel: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
