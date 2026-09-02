import { z } from "zod";

const travelerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const createBookingSchema = z.object({
  packageId: z.string().min(1, "Package is required"),
  travelDate: z.string().min(1, "Travel date is required"),
  numberOfTravelers: z.number().min(1, "At least 1 traveler required"),
  specialRequests: z.string().optional(),
  travelers: z.array(travelerSchema).min(1, "At least one traveler detail required"),
  emergencyContact: z
    .object({
      name: z.string().min(1),
      phone: z.string().min(1),
      relationship: z.string().min(1),
    })
    .optional(),
  dietaryRequirements: z.string().optional(),
  medicalConditions: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum({ pending: "pending", confirmed: "confirmed", completed: "completed", cancelled: "cancelled" }),
  cancelReason: z.string().optional(),
});

export const bookingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(10000).default(10),
  status: z.enum({ pending: "pending", confirmed: "confirmed", completed: "completed", cancelled: "cancelled" }).optional(),
  paymentStatus: z.enum({ unpaid: "unpaid", partial: "partial", paid: "paid", refunded: "refunded" }).optional(),
  packageId: z.string().optional(),
  destinationId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum({ newest: "newest", oldest: "oldest", travel_date: "travel_date", amount_high: "amount_high", amount_low: "amount_low" }).default("newest"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type BookingQuery = z.infer<typeof bookingQuerySchema>;
