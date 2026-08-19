import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 5, "Rating must be 1-5"),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
