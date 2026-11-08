import { z } from "zod";
export const destinationSchema = z.object({
  name: z.string().trim().min(2).max(180),
  province_id: z.coerce.number().int().positive(),
  district_id: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional(),
  category_id: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional(),
  excerpt: z.string().max(350).optional(),
  description: z.string().min(10),
  address: z.string().max(250).optional(),
  latitude: z
    .union([z.coerce.number().min(-90).max(90), z.literal("")])
    .optional(),
  longitude: z
    .union([z.coerce.number().min(-180).max(180), z.literal("")])
    .optional(),
  cover_image: z.string().max(1000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean().optional(),
});
export const articleSchema = z.object({
  province_id: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional(),
  title: z.string().trim().min(3).max(220),
  category_id: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional(),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(20),
  cover_image: z.string().max(1000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean().optional(),
});
