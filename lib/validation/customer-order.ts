import { z } from "zod";
import { garmentTypes } from "./design";
import { measurementsSchema } from "./measurements";

export const customerOrderRequestSchema = z.object({
  quantity: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "Quantity must be a positive whole number"),
  delivery_option: z.enum(["pickup", "delivery"]).default("pickup"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const customerTailoringOrderSchema = z.object({
  garment_type: z.enum(garmentTypes),
  design_id: z.string().uuid().optional().or(z.literal("")),
  quantity: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "Quantity must be a positive whole number"),
  delivery_option: z.enum(["pickup", "delivery"]).default("pickup"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  measurements: measurementsSchema,
});
export type CustomerOrderRequestInput = z.infer<typeof customerOrderRequestSchema>;
export type CustomerTailoringOrderInput = z.infer<typeof customerTailoringOrderSchema>;
