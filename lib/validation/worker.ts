import { z } from "zod";
import { garmentTypes } from "./design";

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export const workerSchema = z.object({
  name: z.string().trim().min(2).max(150),
  occupation: z.string().trim().max(100).optional().or(z.literal("")),
  contact_number: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  employee_number: z.string().trim().max(50).optional().or(z.literal("")),
  salary: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0), "Must be a non-negative amount")
    .optional(),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type WorkerInput = z.infer<typeof workerSchema>;

export const workTypes = ["scissors", "sewing", "correction", "other"] as const;
export type WorkType = (typeof workTypes)[number];
export const workTypeLabels: Record<WorkType, string> = {
  scissors: "Scissors",
  sewing: "Sewing",
  correction: "Correction",
  other: "Other",
};

export const assignmentStatuses = ["assigned", "in_progress", "completed", "canceled"] as const;
export type AssignmentStatus = (typeof assignmentStatuses)[number];
export const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
};

const money = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v >= 0, "Must be a non-negative amount");

export const assignmentSchema = z.object({
  worker_id: z.string().uuid("Select a worker"),
  order_id: z.string().uuid("Enter the order's serial number"),
  garment_type: z.enum(garmentTypes),
  work_type: z.enum(workTypes),
  quantity: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "Quantity must be a positive whole number"),
  submitted_date: z.string().min(1, "Submission date is required"),
  due_date: z.string().optional().or(z.literal("")),
  status: z.enum(assignmentStatuses).default("assigned"),
  wage: money,
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const payModels = ["weekly", "biweekly", "monthly", "per_job"] as const;
export type PayModel = (typeof payModels)[number];
export const payModelLabels: Record<PayModel, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  per_job: "Per Job",
};

export const workerPaymentSchema = z.object({
  pay_model: z.enum(payModels).default("per_job"),
  amount: money.refine((v) => v > 0, "Enter a positive amount"),
  period_start: z.string().optional().or(z.literal("")),
  period_end: z.string().optional().or(z.literal("")),
  paid_at: z.string().min(1, "Payment date is required"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type WorkerPaymentInput = z.infer<typeof workerPaymentSchema>;

export const workerAdvanceSchema = z.object({
  amount: money.refine((v) => v > 0, "Enter a positive amount"),
  advance_date: z.string().min(1, "Date is required"),
  salary_period: z.string().trim().max(50).optional().or(z.literal("")),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type WorkerAdvanceInput = z.infer<typeof workerAdvanceSchema>;
