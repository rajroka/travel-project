import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId:     z.string().optional(),
  packageId:     z.string().optional(),
  destinationId: z.string().optional(),
  rating:   z.number().min(1).max(5),
  title:    z.string().optional(),
  comment:  z.string().min(5, "Review must be at least 5 characters"),
  photos:   z.array(z.string().url()).optional(),
}).refine(d => d.packageId || d.destinationId, {
  message: "Either packageId or destinationId is required",
});

export const respondReviewSchema = z.object({
  comment: z.string().min(1, "Response comment is required"),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  packageId: z.string().optional(),
  destinationId: z.string().optional(),
  hidden: z.coerce.boolean().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxRating: z.coerce.number().min(1).max(5).optional(),
  sort: z.enum({ newest: "newest", oldest: "oldest", rating_high: "rating_high", rating_low: "rating_low" }).default("newest"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type RespondReviewInput = z.infer<typeof respondReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
