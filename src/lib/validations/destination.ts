import { z } from "zod";

const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().url().optional()
);

export const createDestinationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  description: z.string().min(3, "Description is required"),
  shortDescription: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  coverImage: optionalUrl,
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  bestSeason: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

export const updateDestinationSchema = createDestinationSchema.partial();

export const destinationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(["name", "rating", "newest", "popular"]).default("newest"),
});

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
export type DestinationQuery = z.infer<typeof destinationQuerySchema>;
