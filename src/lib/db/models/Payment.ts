import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: "esewa" | "khalti" | "stripe" | "paypal" | "cash";
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentDate?: Date;
  receiptUrl?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "stripe", "paypal", "cash"],
      required: true,
    },
    transactionId: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentDate: { type: Date },
    receiptUrl: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    refundedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ paymentStatus: 1 });
PaymentSchema.index({ paymentMethod: 1 });

export const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
