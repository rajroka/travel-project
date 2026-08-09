import mongoose, { Document, Schema } from "mongoose";

export interface IEmailNotification extends Document {
  user: mongoose.Types.ObjectId;
  toEmail: string;
  subject: string;
  templateType:
    | "welcome"
    | "email_verification"
    | "password_reset"
    | "booking_confirmation"
    | "booking_status"
    | "payment_receipt"
    | "recommendation"
    | "promotion";
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailNotificationSchema = new Schema<IEmailNotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    toEmail: { type: String, required: true },
    subject: { type: String, required: true },
    templateType: {
      type: String,
      enum: [
        "welcome",
        "email_verification",
        "password_reset",
        "booking_confirmation",
        "booking_status",
        "payment_receipt",
        "recommendation",
        "promotion",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    sentAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const EmailNotification =
  mongoose.models.EmailNotification ||
  mongoose.model<IEmailNotification>("EmailNotification", EmailNotificationSchema);
