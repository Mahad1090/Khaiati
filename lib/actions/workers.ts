"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";
import {
  workerSchema,
  assignmentSchema,
  workerPaymentSchema,
  workerAdvanceSchema,
} from "@/lib/validation/worker";
import type { ActionResult } from "./customers";

async function nextWorkerNo() {
  const { rows } = await query<{ next: number }>(`select nextval('worker_no_seq')::int as next`);
  return `W-${String(rows[0].next).padStart(4, "0")}`;
}

export type WorkerRow = {
  id: string;
  worker_no: string;
  name: string;
  occupation: string | null;
  contact_number: string | null;
  employee_number: string | null;
  salary: string | null;
  note: string | null;
  is_active: boolean;
  created_at: string;
};

export async function createWorker(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = workerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, occupation, contact_number, employee_number, salary, note } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const workerNo = await nextWorkerNo();
    const { rows } = await query<{ id: string }>(
      `insert into workers (business_id, worker_no, name, occupation, contact_number, employee_number, salary, note)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
      [
        businessId,
        workerNo,
        name,
        occupation || null,
        contact_number || null,
        employee_number || null,
        salary ?? null,
        note || null,
      ]
    );
    revalidatePath("/admin/workers");
    return { ok: true, data: rows[0] };
  } catch (err) {
    console.error("createWorker failed", err);
    return { ok: false, error: "Could not create worker. Please try again." };
  }
}

export async function updateWorker(id: string, input: unknown): Promise<ActionResult> {
  const parsed = workerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, occupation, contact_number, employee_number, salary, note } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const { rowCount } = await query(
      `update workers
       set name = $1, occupation = $2, contact_number = $3, employee_number = $4, salary = $5, note = $6
       where id = $7 and business_id = $8`,
      [name, occupation || null, contact_number || null, employee_number || null, salary ?? null, note || null, id, businessId]
    );
    if (!rowCount) {
      return { ok: false, error: "Worker not found." };
    }
    revalidatePath("/admin/workers");
    revalidatePath(`/admin/workers/${id}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateWorker failed", err);
    return { ok: false, error: "Could not update worker. Please try again." };
  }
}

export async function searchWorkers(term: string): Promise<WorkerRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = `and (worker_no ilike $2 or name ilike $2 or contact_number ilike $2 or employee_number ilike $2)`;
  }
  const { rows } = await query<WorkerRow>(
    `select id, worker_no, name, occupation, contact_number, employee_number, salary, note, is_active, created_at
     from workers
     where business_id = $1 ${extra}
     order by created_at desc
     limit 50`,
    params
  );
  return rows;
}

export async function getWorkerById(id: string): Promise<WorkerRow | null> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<WorkerRow>(
    `select id, worker_no, name, occupation, contact_number, employee_number, salary, note, is_active, created_at
     from workers where id = $1 and business_id = $2`,
    [id, businessId]
  );
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------------------

export async function createAssignment(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { worker_id, order_id, garment_type, work_type, quantity, submitted_date, due_date, status, wage, note } =
    parsed.data;
  try {
    const businessId = await getCurrentBusinessId();

    const workerOk = await query<{ id: string }>(
      `select id from workers where id = $1 and business_id = $2`,
      [worker_id, businessId]
    );
    if (workerOk.rows.length === 0) {
      return { ok: false, error: "Worker not found." };
    }
    if (order_id) {
      const orderOk = await query<{ id: string }>(
        `select id from orders where id = $1 and business_id = $2`,
        [order_id, businessId]
      );
      if (orderOk.rows.length === 0) {
        return { ok: false, error: "Order not found." };
      }
    }

    const { rows } = await query<{ id: string }>(
      `insert into worker_assignments
         (worker_id, order_id, garment_type, work_type, quantity, submitted_date, due_date, status, wage, note)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning id`,
      [
        worker_id,
        order_id || null,
        garment_type,
        work_type,
        quantity,
        submitted_date,
        due_date || null,
        status,
        wage,
        note || null,
      ]
    );
    revalidatePath(`/admin/workers/${worker_id}`);
    if (order_id) revalidatePath(`/admin/orders/${order_id}`);
    return { ok: true, data: rows[0] };
  } catch (err) {
    console.error("createAssignment failed", err);
    return { ok: false, error: "Could not create assignment. Please try again." };
  }
}

export type AssignmentRow = {
  id: string;
  garment_type: string;
  work_type: string;
  quantity: number;
  submitted_date: string;
  due_date: string | null;
  status: string;
  wage: string;
  note: string | null;
  order_no: string | null;
};

export type GlobalAssignmentRow = AssignmentRow & { worker_id: string; worker_name: string; worker_no: string };

export async function getAllAssignments(term = ""): Promise<GlobalAssignmentRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = `and (w.name ilike $2 or w.worker_no ilike $2 or o.order_no ilike $2)`;
  }
  const { rows } = await query<GlobalAssignmentRow>(
    `select wa.id, wa.garment_type, wa.work_type, wa.quantity, wa.submitted_date, wa.due_date,
            wa.status, wa.wage, wa.note, o.order_no, w.id as worker_id, w.name as worker_name, w.worker_no
     from worker_assignments wa
     join workers w on w.id = wa.worker_id
     left join orders o on o.id = wa.order_id
     where w.business_id = $1 ${extra}
     order by wa.created_at desc
     limit 200`,
    params
  );
  return rows;
}

export async function getWorkerAssignments(workerId: string): Promise<AssignmentRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<AssignmentRow>(
    `select wa.id, wa.garment_type, wa.work_type, wa.quantity, wa.submitted_date, wa.due_date,
            wa.status, wa.wage, wa.note, o.order_no
     from worker_assignments wa
     join workers w on w.id = wa.worker_id
     left join orders o on o.id = wa.order_id
     where wa.worker_id = $1 and w.business_id = $2
     order by wa.created_at desc`,
    [workerId, businessId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Payments (salary / wages)
// ---------------------------------------------------------------------------

export async function addWorkerPayment(workerId: string, input: unknown): Promise<ActionResult> {
  const parsed = workerPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { pay_model, amount, period_start, period_end, paid_at, note } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const workerOk = await query<{ id: string }>(
      `select id from workers where id = $1 and business_id = $2`,
      [workerId, businessId]
    );
    if (workerOk.rows.length === 0) {
      return { ok: false, error: "Worker not found." };
    }
    await query(
      `insert into worker_payments (worker_id, pay_model, amount, period_start, period_end, paid_at, note)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [workerId, pay_model, amount, period_start || null, period_end || null, paid_at, note || null]
    );
    revalidatePath(`/admin/workers/${workerId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("addWorkerPayment failed", err);
    return { ok: false, error: "Could not record payment." };
  }
}

export type WorkerPaymentRow = {
  id: string;
  pay_model: string;
  amount: string;
  period_start: string | null;
  period_end: string | null;
  paid_at: string;
  note: string | null;
};

export type GlobalPaymentRow = WorkerPaymentRow & { worker_id: string; worker_name: string; worker_no: string };

export async function getAllWorkerPayments(term = ""): Promise<GlobalPaymentRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = `and (w.name ilike $2 or w.worker_no ilike $2)`;
  }
  const { rows } = await query<GlobalPaymentRow>(
    `select p.id, p.pay_model, p.amount, p.period_start, p.period_end, p.paid_at, p.note,
            w.id as worker_id, w.name as worker_name, w.worker_no
     from worker_payments p
     join workers w on w.id = p.worker_id
     where w.business_id = $1 ${extra}
     order by p.paid_at desc
     limit 200`,
    params
  );
  return rows;
}

export async function getWorkerPayments(workerId: string): Promise<WorkerPaymentRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<WorkerPaymentRow>(
    `select p.id, p.pay_model, p.amount, p.period_start, p.period_end, p.paid_at, p.note
     from worker_payments p
     join workers w on w.id = p.worker_id
     where p.worker_id = $1 and w.business_id = $2
     order by p.paid_at desc`,
    [workerId, businessId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Advances
// ---------------------------------------------------------------------------

export async function addWorkerAdvance(workerId: string, input: unknown): Promise<ActionResult> {
  const parsed = workerAdvanceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { amount, advance_date, salary_period, reason, note } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const workerOk = await query<{ id: string }>(
      `select id from workers where id = $1 and business_id = $2`,
      [workerId, businessId]
    );
    if (workerOk.rows.length === 0) {
      return { ok: false, error: "Worker not found." };
    }
    await query(
      `insert into worker_advances (worker_id, amount, advance_date, salary_period, reason, note)
       values ($1,$2,$3,$4,$5,$6)`,
      [workerId, amount, advance_date, salary_period || null, reason || null, note || null]
    );
    revalidatePath(`/admin/workers/${workerId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("addWorkerAdvance failed", err);
    return { ok: false, error: "Could not record advance." };
  }
}

export type WorkerAdvanceRow = {
  id: string;
  amount: string;
  advance_date: string;
  salary_period: string | null;
  reason: string | null;
  note: string | null;
};

export type GlobalAdvanceRow = WorkerAdvanceRow & { worker_id: string; worker_name: string; worker_no: string };

export async function getAllWorkerAdvances(term = ""): Promise<GlobalAdvanceRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = `and (w.name ilike $2 or w.worker_no ilike $2)`;
  }
  const { rows } = await query<GlobalAdvanceRow>(
    `select a.id, a.amount, a.advance_date, a.salary_period, a.reason, a.note,
            w.id as worker_id, w.name as worker_name, w.worker_no
     from worker_advances a
     join workers w on w.id = a.worker_id
     where w.business_id = $1 ${extra}
     order by a.advance_date desc
     limit 200`,
    params
  );
  return rows;
}

export async function getWorkerAdvances(workerId: string): Promise<WorkerAdvanceRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<WorkerAdvanceRow>(
    `select a.id, a.amount, a.advance_date, a.salary_period, a.reason, a.note
     from worker_advances a
     join workers w on w.id = a.worker_id
     where a.worker_id = $1 and w.business_id = $2
     order by a.advance_date desc`,
    [workerId, businessId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Financial summary
// ---------------------------------------------------------------------------

export type WorkerFinancialSummary = {
  totalWages: number; // earned from assignments
  totalPaid: number; // salary/wage payments
  totalAdvances: number;
  remaining: number; // earned - paid - advances
};

export async function getWorkerFinancialSummary(workerId: string): Promise<WorkerFinancialSummary> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<{ total_wages: string; total_paid: string; total_advances: string }>(
    `select
       coalesce((select sum(wage * quantity) from worker_assignments where worker_id = w.id and status = 'completed'), 0) as total_wages,
       coalesce((select sum(amount) from worker_payments where worker_id = w.id), 0) as total_paid,
       coalesce((select sum(amount) from worker_advances where worker_id = w.id), 0) as total_advances
     from workers w
     where w.id = $1 and w.business_id = $2`,
    [workerId, businessId]
  );
  const totalWages = Number(rows[0]?.total_wages ?? 0);
  const totalPaid = Number(rows[0]?.total_paid ?? 0);
  const totalAdvances = Number(rows[0]?.total_advances ?? 0);
  return {
    totalWages,
    totalPaid,
    totalAdvances,
    remaining: totalWages - totalPaid - totalAdvances,
  };
}
