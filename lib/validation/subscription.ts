import { z } from "zod";

const money = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v >= 0, "Must be a non-negative amount");

export const planSchema = z.object({
  name: z.string().trim().min(2, "Plan name is required").max(100),
  price: money,
  duration_days: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "Duration must be a positive number of days"),
  commission_rate: money.default(0),
  is_active: z.boolean().default(true),
});
export type PlanInput = z.infer<typeof planSchema>;

export const paymentStatuses = ["pending", "paid", "failed", "refunded", "cancelled"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];
export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};
