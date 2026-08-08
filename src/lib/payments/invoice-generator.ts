import { generateInvoiceNumber } from "@/lib/auth/auth";
import { Invoice } from "@/lib/db/models/Invoice";
import type { Types } from "mongoose";

export interface CreateInvoiceParams {
  paymentId: Types.ObjectId | string;
  bookingId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  amount: number;
  paymentMethod?: string;
  discount?: number;
  tax?: number;
}

/**
 * Creates an Invoice document and returns it.
 * Called after any successful payment (eSewa, Khalti, Stripe, PayPal, cash).
 */
export async function createInvoice({
  paymentId,
  bookingId,
  userId,
  amount,
  paymentMethod = "unknown",
  discount = 0,
  tax = 0,
}: CreateInvoiceParams) {
  const invoiceNumber = generateInvoiceNumber();
  const subtotal = amount + discount; // gross before discount
  const totalAmount = subtotal - discount + tax;

  const invoice = await Invoice.create({
    payment: paymentId,
    booking: bookingId,
    user: userId,
    invoiceNumber,
    issueDate: new Date(),
    totalAmount,
    subtotal,
    tax,
    discount,
    items: [
      {
        description: `Tour Package Booking (${paymentMethod})`,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ],
    status: "paid",
  });

  return invoice;
}
