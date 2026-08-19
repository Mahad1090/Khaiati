"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";
import { fabricSchema } from "@/lib/validation/fabric";
import type { ActionResult } from "./customers";

async function nextFabricNo() {
  const { rows } = await query<{ next: number }>(`select nextval('fabric_no_seq')::int as next`);
  return `F-${String(rows[0].next).padStart(4, "0")}`;
}

export type FabricRow = {
  id: string;
  fabric_no: string;
  name: string;
  fabric_type: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  color: string | null;
  price_per_meter: string;
  selling_price: string;
  unit: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
};

export async function createFabric(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = fabricSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, fabric_type, supplier_id, color, price_per_meter, selling_price, unit, note, is_active } =
    parsed.data;
  try {
    const businessId = await getCurrentBusinessId();

    if (supplier_id) {
      const supplierOk = await query<{ id: string }>(
        `select id from fabric_suppliers where id = $1 and business_id = $2`,
        [supplier_id, businessId]
      );
      if (supplierOk.rows.length === 0) {
        return { ok: false, error: "Supplier not found." };
      }
    }

    const fabricNo = await nextFabricNo();
    const { rows } = await query<{ id: string }>(
      `insert into fabrics (business_id, fabric_no, name, fabric_type, supplier_id, color, price_per_meter, selling_price, unit, note, is_active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`,
      [
        businessId,
        fabricNo,
        name,
        fabric_type || null,
        supplier_id || null,
        color || null,
        price_per_meter,
        selling_price,
        unit,
        note || null,
        is_active,
      ]
    );
    revalidatePath("/admin/fabrics");
    return { ok: true, data: rows[0] };
  } catch (err) {
    console.error("createFabric failed", err);
    return { ok: false, error: "Could not create fabric. Please try again." };
  }
}

export async function updateFabric(id: string, input: unknown): Promise<ActionResult> {
  const parsed = fabricSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, fabric_type, supplier_id, color, price_per_meter, selling_price, unit, note, is_active } =
    parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const { rowCount } = await query(
      `update fabrics
       set name = $1, fabric_type = $2, supplier_id = $3, color = $4, price_per_meter = $5,
           selling_price = $6, unit = $7, note = $8, is_active = $9
       where id = $10 and business_id = $11`,
      [name, fabric_type || null, supplier_id || null, color || null, price_per_meter, selling_price, unit, note || null, is_active, id, businessId]
    );
    if (!rowCount) {
      return { ok: false, error: "Fabric not found." };
    }
    revalidatePath("/admin/fabrics");
    revalidatePath(`/admin/fabrics/${id}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateFabric failed", err);
    return { ok: false, error: "Could not update fabric. Please try again." };
  }
}

export async function listFabrics(filters?: { search?: string; activeOnly?: boolean }): Promise<
  (FabricRow & { availableMeters: number })[]
> {
  const businessId = await getCurrentBusinessId();
  const conditions: string[] = [`f.business_id = $1`];
  const params: unknown[] = [businessId];
  if (filters?.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`(f.name ilike $${params.length} or f.fabric_no ilike $${params.length} or f.color ilike $${params.length})`);
  }
  if (filters?.activeOnly) {
    conditions.push(`f.is_active = true`);
  }
  const where = `where ${conditions.join(" and ")}`;

  const { rows } = await query<FabricRow & { available_meters: string }>(
    `select f.id, f.fabric_no, f.name, f.fabric_type, f.supplier_id, s.company_name as supplier_name,
            f.color, f.price_per_meter, f.selling_price, f.unit, f.note, f.is_active, f.created_at,
            coalesce((select sum(quantity_meters) from fabric_stock_movements where fabric_id = f.id), 0) as available_meters
     from fabrics f
     left join fabric_suppliers s on s.id = f.supplier_id
     ${where}
     order by f.created_at desc`,
    params
  );
  return rows.map((r) => ({ ...r, availableMeters: Number(r.available_meters) }));
}

export async function getFabricById(id: string): Promise<(FabricRow & { availableMeters: number }) | null> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<FabricRow & { available_meters: string }>(
    `select f.id, f.fabric_no, f.name, f.fabric_type, f.supplier_id, s.company_name as supplier_name,
            f.color, f.price_per_meter, f.selling_price, f.unit, f.note, f.is_active, f.created_at,
            coalesce((select sum(quantity_meters) from fabric_stock_movements where fabric_id = f.id), 0) as available_meters
     from fabrics f
     left join fabric_suppliers s on s.id = f.supplier_id
     where f.id = $1 and f.business_id = $2`,
    [id, businessId]
  );
  const row = rows[0];
  if (!row) return null;
  return { ...row, availableMeters: Number(row.available_meters) };
}

export type StockMovementRow = {
  id: string;
  movement_type: string;
  quantity_meters: string;
  note: string | null;
  created_at: string;
};

export async function getFabricStockHistory(fabricId: string): Promise<StockMovementRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<StockMovementRow>(
    `select m.id, m.movement_type, m.quantity_meters, m.note, m.created_at
     from fabric_stock_movements m
     join fabrics f on f.id = m.fabric_id
     where m.fabric_id = $1 and f.business_id = $2
     order by m.created_at desc`,
    [fabricId, businessId]
  );
  return rows;
}
