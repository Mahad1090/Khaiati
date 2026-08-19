import { z } from "zod";

const money = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v > 0, "Enter a positive amount");

export const expenseCategories = [
  "company_payment",
  "shop",
  "electricity",
  "rent",
  "transportation",
  "other",
] as const;
export type ExpenseCategory = (typeof expenseCategories)[number];
export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  company_payment: "Company Payment",
  shop: "Shop Expense",
  electricity: "Electricity",
  rent: "Rent",
  transportation: "Transportation",
  other: "Other",
};

export const incomeSchema = z.object({
  amount: money,
  income_date: z.string().min(1, "Date is required"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type IncomeInput = z.infer<typeof incomeSchema>;

export const expenseSchema = z.object({
  category: z.enum(expenseCategories),
  amount: money,
  expense_date: z.string().min(1, "Date is required"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;
