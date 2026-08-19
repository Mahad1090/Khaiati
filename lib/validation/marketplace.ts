import { z } from "zod";
import { garmentTypes } from "./design";

export function slugifyCategory(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const money = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v >= 0, "Must be a non-negative amount");

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  categoryName: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  fabric_type: z.string().trim().max(100).optional().or(z.literal("")),
  color: z.string().trim().max(50).optional().or(z.literal("")),
  price: money,
  stock_quantity: money.default(0),
  is_available: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productSchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  categoryName: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  clothing_category: z.enum(garmentTypes).optional().or(z.literal("")),
  price: money,
  estimated_completion_days: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .optional(),
  is_available: z.boolean().default(true),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
