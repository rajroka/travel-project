import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  packageId: z.string().min(1, "Package ID is required"),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  photos: z.array(z.string().url()).optional(),
});

export const respondReviewSchema = z.object({
  comment: z.string().min(1, "Response comment is required"),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  packageId: z.string().optional(),
  hidden: z.coerce.boolean().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxRating: z.coerce.number().min(1).max(5).optional(),
  sort: z.enum({ newest: "newest", oldest: "oldest", rating_high: "rating_high", rating_low: "rating_low" }).default("newest"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type RespondReviewInput = z.infer<typeof respondReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
