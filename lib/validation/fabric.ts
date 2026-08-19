import { z } from "zod";

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export const supplierSchema = z.object({
  company_name: z.string().trim().min(2).max(150),
  contact_person: z.string().trim().max(150).optional().or(z.literal("")),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number").optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  company_number: z.string().trim().max(50).optional().or(z.literal("")),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type SupplierInput = z.infer<typeof supplierSchema>;

const money = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v >= 0, "Must be a non-negative amount");

const meters = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v > 0, "Must be a positive quantity");

export const fabricSchema = z.object({
  name: z.string().trim().min(2).max(150),
  fabric_type: z.string().trim().max(100).optional().or(z.literal("")),
  supplier_id: z.string().uuid().optional().or(z.literal("")),
  color: z.string().trim().max(50).optional().or(z.literal("")),
  price_per_meter: money,
  selling_price: money,
  unit: z.string().trim().max(20).default("meter"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});
export type FabricInput = z.infer<typeof fabricSchema>;

export const paymentTypes = ["cash", "bank_transfer", "credit", "other"] as const;
export type PaymentType = (typeof paymentTypes)[number];
export const paymentTypeLabels: Record<PaymentType, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  credit: "Credit",
  other: "Other",
};

export const purchaseSchema = z.object({
  fabric_id: z.string().uuid("Select a fabric"),
  supplier_id: z.string().uuid("Select a supplier"),
  company_bill_number: z.string().trim().max(50).optional().or(z.literal("")),
  price_per_meter: money,
  size_meters: meters,
  color: z.string().trim().max(50).optional().or(z.literal("")),
  sale_price: money,
  purchase_date: z.string().min(1, "Purchase date is required"),
  amount_paid: money.default(0),
  payment_type: z.enum(paymentTypes).default("cash"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type PurchaseInput = z.infer<typeof purchaseSchema>;

export const saleSchema = z.object({
  fabric_id: z.string().uuid("Select a fabric"),
  customer_id: z.string().uuid().optional().or(z.literal("")),
  color: z.string().trim().max(50).optional().or(z.literal("")),
  size_meters: meters,
  price_per_meter: money,
  sale_date: z.string().min(1, "Sale date is required"),
  amount_paid: money.default(0),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type SaleInput = z.infer<typeof saleSchema>;
