"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId, requireOwner } from "@/lib/auth/business-context";
import { incomeSchema, expenseSchema, type ExpenseCategory } from "@/lib/validation/finance";
import type { ActionResult } from "./customers";

async function nextIncomeNo() {
  const { rows } = await query<{ next: number }>(`select nextval('income_no_seq')::int as next`);
  return `IN-${String(rows[0].next).padStart(5, "0")}`;
}
async function nextExpenseNo() {
  const { rows } = await query<{ next: number }>(`select nextval('expense_no_seq')::int as next`);
  return `EX-${String(rows[0].next).padStart(5, "0")}`;
}

export async function addIncome(input: unknown): Promise<ActionResult> {
  const parsed = incomeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { amount, income_date, note } = parsed.data;
  try {
    await requireOwner();
  } catch {
    return { ok: false, error: "Only the business owner can manage finances." };
  }
  try {
    const businessId = await getCurrentBusinessId();
    const incomeNo = await nextIncomeNo();
    await query(
      `insert into income (business_id, income_no, category, amount, income_date, note) values ($1, $2, 'other', $3, $4, $5)`,
      [businessId, incomeNo, amount, income_date, note || null]
    );
    revalidatePath("/admin/income");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("addIncome failed", err);
    return { ok: false, error: "Could not record income." };
  }
}

export async function addExpense(input: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { category, amount, expense_date, note } = parsed.data;
  try {
    await requireOwner();
  } catch {
    return { ok: false, error: "Only the business owner can manage finances." };
  }
  try {
    const businessId = await getCurrentBusinessId();
    const expenseNo = await nextExpenseNo();
    await query(
      `insert into expenses (business_id, expense_no, category, amount, expense_date, note) values ($1, $2, $3, $4, $5, $6)`,
      [businessId, expenseNo, category, amount, expense_date, note || null]
    );
    revalidatePath("/admin/expenses");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("addExpense failed", err);
    return { ok: false, error: "Could not record expense." };
  }
}

export type ProfitLossReport = {
  startDate: string;
  endDate: string;
  income: {
    sewing: number;
    fabricSales: number;
    other: number;
    total: number;
  };
  expenses: {
    workerSalariesWages: number;
    workerAdvances: number;
    fabricPurchases: number;
    byCategory: Record<ExpenseCategory, number>;
    total: number;
  };
  netProfit: number;
};

/** Every figure is pulled live from the transactional payment tables, scoped
 *  to this business — never duplicated bookkeeping, never another business's
 *  numbers, so the report always matches the ledgers. */
export async function getProfitLoss(startDate: string, endDate: string): Promise<ProfitLossReport> {
  const businessId = await getCurrentBusinessId();
  const [
    { rows: sewingRows },
    { rows: fabricSalesRows },
    { rows: otherIncomeRows },
    { rows: workerPayRows },
    { rows: workerAdvanceRows },
    { rows: fabricPurchaseRows },
    { rows: expenseRows },
  ] = await Promise.all([
    query<{ total: string }>(
      `select coalesce(sum(op.amount), 0) as total
       from order_payments op
       join orders o on o.id = op.order_id
       where o.business_id = $1 and op.paid_at between $2 and $3`,
      [businessId, startDate, endDate]
    ),
    query<{ total: string }>(
      `select coalesce(sum(sp.amount), 0) as total
       from fabric_sale_payments sp
       join fabric_sales fs on fs.id = sp.sale_id
       where fs.business_id = $1 and sp.paid_at between $2 and $3`,
      [businessId, startDate, endDate]
    ),
    query<{ total: string }>(
      `select coalesce(sum(amount), 0) as total from income
       where business_id = $1 and income_date between $2 and $3`,
      [businessId, startDate, endDate]
    ),
    query<{ total: string }>(
      `select coalesce(sum(wp.amount), 0) as total
       from worker_payments wp
       join workers w on w.id = wp.worker_id
       where w.business_id = $1 and wp.paid_at between $2 and $3`,
      [businessId, startDate, endDate]
    ),
    query<{ total: string }>(
      `select coalesce(sum(wa.amount), 0) as total
       from worker_advances wa
       join workers w on w.id = wa.worker_id
       where w.business_id = $1 and wa.advance_date between $2 and $3`,
      [businessId, startDate, endDate]
    ),
    query<{ total: string }>(
      `select coalesce(sum(pp.amount), 0) as total
       from fabric_purchase_payments pp
       join fabric_purchases fp on fp.id = pp.purchase_id
       where fp.business_id = $1 and pp.paid_at between $2 and $3`,
      [businessId, startDate, endDate]
    ),
    query<{ category: ExpenseCategory; total: string }>(
      `select category, coalesce(sum(amount), 0) as total
       from expenses
       where business_id = $1 and expense_date between $2 and $3
       group by category`,
      [businessId, startDate, endDate]
    ),
  ]);

  const sewing = Number(sewingRows[0]?.total ?? 0);
  const fabricSales = Number(fabricSalesRows[0]?.total ?? 0);
  const other = Number(otherIncomeRows[0]?.total ?? 0);
  const totalIncome = sewing + fabricSales + other;

  const workerSalariesWages = Number(workerPayRows[0]?.total ?? 0);
  const workerAdvances = Number(workerAdvanceRows[0]?.total ?? 0);
  const fabricPurchases = Number(fabricPurchaseRows[0]?.total ?? 0);

  const byCategory = Object.fromEntries(
    ["company_payment", "shop", "electricity", "rent", "transportation", "other"].map((c) => [c, 0])
  ) as Record<ExpenseCategory, number>;
  for (const row of expenseRows) {
    byCategory[row.category] = Number(row.total);
  }
  const shopTotal = Object.values(byCategory).reduce((s, v) => s + v, 0);

  const totalExpenses = workerSalariesWages + workerAdvances + fabricPurchases + shopTotal;

  return {
    startDate,
    endDate,
    income: { sewing, fabricSales, other, total: totalIncome },
    expenses: {
      workerSalariesWages,
      workerAdvances,
      fabricPurchases,
      byCategory,
      total: totalExpenses,
    },
    netProfit: totalIncome - totalExpenses,
  };
}

export type IncomeRow = { id: string; income_no: string; amount: string; income_date: string; note: string | null };
export type ExpenseRow = {
  id: string;
  expense_no: string;
  category: ExpenseCategory;
  amount: string;
  expense_date: string;
  note: string | null;
};

export async function listIncome(startDate: string, endDate: string): Promise<IncomeRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<IncomeRow>(
    `select id, income_no, amount, income_date, note from income
     where business_id = $1 and income_date between $2 and $3 order by income_date desc`,
    [businessId, startDate, endDate]
  );
  return rows;
}

export async function listExpenses(startDate: string, endDate: string): Promise<ExpenseRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<ExpenseRow>(
    `select id, expense_no, category, amount, expense_date, note from expenses
     where business_id = $1 and expense_date between $2 and $3 order by expense_date desc`,
    [businessId, startDate, endDate]
  );
  return rows;
}
