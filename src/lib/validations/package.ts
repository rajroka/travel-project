import { z } from "zod";

// Accepts a URL string or empty string (empty = no image)
const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().url().optional()
);

const itineraryDaySchema = z.object({
  day: z.number().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  activities: z.array(z.string()).optional(),
  accommodation: z.string().optional(),
  meals: z.array(z.string()).optional(),
});

export const createPackageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").trim(),
  description: z.string().min(3, "Description is required"),
  shortDescription: z.string().optional(),
  destination: z.string().min(1, "Destination is required"),
  category: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  coverImage: optionalUrl,
  price: z.number().min(1, "Price must be greater than 0"),
  discountPrice: z.number().min(0).optional(),
  duration: z.object({
    days: z.number().min(1),
    nights: z.number().min(0),
  }),
  maxTravelers: z.number().min(1),
  minTravelers: z.number().min(1).optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
  includedServices: z.array(z.string()).optional().default([]),
  excludedServices: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  difficultyLevel: z.enum(["easy", "moderate", "challenging"]).optional(),
  isPromotional: z.boolean().optional(),
  promotionExpiry: z.string().optional(),
});

export const updatePackageSchema = createPackageSchema.partial();

export const packageQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().optional(),
  destination: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minDays: z.coerce.number().optional(),
  maxDays: z.coerce.number().optional(),
  difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
  promotional: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  sort: z.enum(["price_asc", "price_desc", "rating", "newest", "popular"]).default("newest"),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageQuery = z.infer<typeof packageQuerySchema>;
