"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";
import { supplierSchema } from "@/lib/validation/fabric";
import type { ActionResult } from "./customers";

async function nextSupplierNo() {
  const { rows } = await query<{ next: number }>(`select nextval('supplier_no_seq')::int as next`);
  return `S-${String(rows[0].next).padStart(4, "0")}`;
}

export type SupplierRow = {
  id: string;
  supplier_no: string;
  company_name: string;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  company_number: string | null;
  note: string | null;
  created_at: string;
};

export async function createSupplier(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { company_name, contact_person, phone, address, company_number, note } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const supplierNo = await nextSupplierNo();
    const { rows } = await query<{ id: string }>(
      `insert into fabric_suppliers (business_id, supplier_no, company_name, contact_person, phone, address, company_number, note)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [businessId, supplierNo, company_name, contact_person || null, phone || null, address || null, company_number || null, note || null]
    );
    revalidatePath("/admin/suppliers");
    return { ok: true, data: rows[0] };
  } catch (err) {
    console.error("createSupplier failed", err);
    return { ok: false, error: "Could not create supplier. Please try again." };
  }
}

export async function updateSupplier(id: string, input: unknown): Promise<ActionResult> {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { company_name, contact_person, phone, address, company_number, note } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const { rowCount } = await query(
      `update fabric_suppliers
       set company_name = $1, contact_person = $2, phone = $3, address = $4, company_number = $5, note = $6
       where id = $7 and business_id = $8`,
      [company_name, contact_person || null, phone || null, address || null, company_number || null, note || null, id, businessId]
    );
    if (!rowCount) {
      return { ok: false, error: "Supplier not found." };
    }
    revalidatePath("/admin/suppliers");
    revalidatePath(`/admin/suppliers/${id}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateSupplier failed", err);
    return { ok: false, error: "Could not update supplier. Please try again." };
  }
}

export async function searchSuppliers(term: string): Promise<SupplierRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = `and (supplier_no ilike $2 or company_name ilike $2 or phone ilike $2 or company_number ilike $2)`;
  }
  const { rows } = await query<SupplierRow>(
    `select id, supplier_no, company_name, contact_person, phone, address, company_number, note, created_at
     from fabric_suppliers
     where business_id = $1 ${extra}
     order by created_at desc limit 50`,
    params
  );
  return rows;
}

export async function getSupplierById(id: string): Promise<SupplierRow | null> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<SupplierRow>(
    `select id, supplier_no, company_name, contact_person, phone, address, company_number, note, created_at
     from fabric_suppliers where id = $1 and business_id = $2`,
    [id, businessId]
  );
  return rows[0] ?? null;
}

export type SupplierFinancialSummary = {
  totalPurchased: number;
  totalPaid: number;
  outstanding: number;
};

export async function getSupplierFinancialSummary(id: string): Promise<SupplierFinancialSummary> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<{ total_purchased: string; total_paid: string }>(
    `select
       coalesce((select sum(total_price) from fabric_purchases where supplier_id = s.id and business_id = $2), 0) as total_purchased,
       coalesce((select sum(pp.amount) from fabric_purchase_payments pp
                 join fabric_purchases p on p.id = pp.purchase_id
                 where p.supplier_id = s.id and p.business_id = $2), 0) as total_paid
     from fabric_suppliers s
     where s.id = $1 and s.business_id = $2`,
    [id, businessId]
  );
  const totalPurchased = Number(rows[0]?.total_purchased ?? 0);
  const totalPaid = Number(rows[0]?.total_paid ?? 0);
  return { totalPurchased, totalPaid, outstanding: totalPurchased - totalPaid };
}

export type SupplierPurchaseRow = {
  id: string;
  purchase_no: string;
  fabric_name: string;
  company_bill_number: string | null;
  total_price: string;
  amount_paid: string;
  purchase_date: string;
};

export async function getSupplierPurchases(id: string): Promise<SupplierPurchaseRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<SupplierPurchaseRow>(
    `select p.id, p.purchase_no, f.name as fabric_name, p.company_bill_number, p.total_price,
            coalesce((select sum(amount) from fabric_purchase_payments where purchase_id = p.id), 0) as amount_paid,
            p.purchase_date
     from fabric_purchases p
     join fabrics f on f.id = p.fabric_id
     where p.supplier_id = $1 and p.business_id = $2
     order by p.created_at desc`,
    [id, businessId]
  );
  return rows;
}
