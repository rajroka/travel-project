import mongoose, { Document, Schema } from "mongoose";

export interface IInvoice extends Document {
  payment: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  invoiceNumber: string;
  issueDate: Date;
  dueDate?: Date;
  totalAmount: number;
  subtotal: number;
  tax: number;
  discount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  status: "draft" | "issued" | "paid" | "cancelled";
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    payment: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "issued", "paid", "cancelled"],
      default: "issued",
    },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
