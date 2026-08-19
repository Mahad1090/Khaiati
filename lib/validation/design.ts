import { z } from "zod";

export const garmentTypes = ["shirt", "vest", "coat", "pants", "jacket"] as const;
export type GarmentType = (typeof garmentTypes)[number];

export const garmentTypeLabels: Record<GarmentType, string> = {
  shirt: "Shirt / Dress",
  vest: "Vest",
  coat: "Coat",
  pants: "Pants",
  jacket: "Jacket",
};

export const designSchema = z.object({
  name: z.string().trim().min(2).max(150),
  garment_type: z.enum(garmentTypes),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  image_path: z.string().trim().max(500).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type DesignInput = z.infer<typeof designSchema>;
