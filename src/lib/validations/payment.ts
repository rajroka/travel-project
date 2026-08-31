import { z } from "zod";

export const initiatePaymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  paymentMethod: z.enum(["esewa", "khalti", "stripe", "paypal", "cash"]).optional().default("stripe"),
  amount: z.number().min(1, "Amount must be greater than 0"),
});

export const verifyPaymentSchema = z.object({
  bookingId: z.string().min(1),
  transactionId: z.string().min(1),
  paymentMethod: z.enum(["esewa", "khalti", "stripe", "paypal"]),
  gatewayData: z.record(z.string(), z.unknown()).optional(),
});

export const cashPaymentSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().min(1),
  notes: z.string().optional(),
});

export const refundSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  refundAmount: z.number().min(1, "Refund amount must be greater than 0"),
  refundReason: z.string().min(1, "Refund reason is required"),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  method: z.enum(["esewa", "khalti", "stripe", "paypal", "cash"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
