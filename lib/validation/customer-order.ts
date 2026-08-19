import { z } from "zod";

export const customerOrderRequestSchema = z.object({
  quantity: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "Quantity must be a positive whole number"),
  delivery_option: z.enum(["pickup", "delivery"]).default("pickup"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type CustomerOrderRequestInput = z.infer<typeof customerOrderRequestSchema>;
