import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  bookingNumber: string;
  user: mongoose.Types.ObjectId;
  package: mongoose.Types.ObjectId;
  travelDate: Date;
  numberOfTravelers: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  specialRequests?: string;
  cancelReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    package: { type: Schema.Types.ObjectId, ref: "TourPackage", required: true },
    travelDate: { type: Date, required: true },
    numberOfTravelers: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
    },
    specialRequests: { type: String },
    cancelReason: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    cancelledAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ bookingNumber: 1 });
BookingSchema.index({ status: 1, travelDate: 1 });

export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
