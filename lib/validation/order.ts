import { z } from "zod";
import { garmentTypes } from "./design";
import { measurementsSchema } from "./measurements";

export const orderStatuses = [
  "new_order",
  "measurements_taken",
  "submitted_to_scissors",
  "submitted_to_sewing",
  "in_process",
  "completed",
  "delivered",
  "canceled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  new_order: "New Order",
  measurements_taken: "Measurements Taken",
  submitted_to_scissors: "Submitted to Scissors",
  submitted_to_sewing: "Submitted to Sewing",
  in_process: "In Process",
  completed: "Completed",
  delivered: "Delivered to Customer",
  canceled: "Canceled",
};

// Money as a string in the schema (form inputs are strings); converted to a
// fixed-point number server-side before any arithmetic touches the database.
const money = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v >= 0, "Must be a non-negative amount");

export const orderItemSchema = z.object({
  garment_type: z.enum(garmentTypes),
  design_id: z.string().uuid().optional().or(z.literal("")),
  quantity: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "Quantity must be a positive whole number"),
  price_per_piece: money,
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  measurements: measurementsSchema,
});

export const orderKinds = ["stitching", "product", "product_and_stitching"] as const;
export type OrderKind = (typeof orderKinds)[number];
export const orderKindLabels: Record<OrderKind, string> = {
  stitching: "Customer's Own Fabric — Stitching Only",
  product: "Fabric/Product Purchase Only",
  product_and_stitching: "Buy Fabric + Stitching",
};

export const deliveryOptions = ["pickup", "delivery"] as const;
export type DeliveryOption = (typeof deliveryOptions)[number];
export const deliveryOptionLabels: Record<DeliveryOption, string> = {
  pickup: "Customer Pickup",
  delivery: "Delivery",
};

export const orderSchema = z.object({
  customer_id: z.string().uuid("Select a customer"),
  order_date: z.string().min(1, "Order date is required"),
  due_date: z.string().optional().or(z.literal("")),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1, "Add at least one garment"),
  paid_amount: money.default(0),
  order_kind: z.enum(orderKinds).default("stitching"),
  delivery_option: z.enum(deliveryOptions).default("pickup"),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
