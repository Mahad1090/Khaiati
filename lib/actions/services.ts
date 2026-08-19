"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";
import { serviceSchema, slugifyCategory } from "@/lib/validation/marketplace";
import type { ActionResult } from "./customers";

async function nextServiceNo() {
  const { rows } = await query<{ next: number }>(`select nextval('service_no_seq')::int as next`);
  return `SV-${String(rows[0].next).padStart(4, "0")}`;
}

async function findOrCreateServiceCategory(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugifyCategory(trimmed);
  const { rows } = await query<{ id: string }>(
    `insert into service_categories (name, slug) values ($1, $2)
     on conflict (slug) do update set name = excluded.name
     returning id`,
    [trimmed, slug]
  );
  return rows[0].id;
}

export type ServiceRow = {
  id: string;
  service_no: string;
  name: string;
  category_name: string | null;
  description: string | null;
  clothing_category: string | null;
  price: string;
  estimated_completion_days: number | null;
  is_available: boolean;
  created_at: string;
};

export async function createService(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, categoryName, description, clothing_category, price, estimated_completion_days, is_available } =
    parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const categoryId = categoryName ? await findOrCreateServiceCategory(categoryName) : null;
    const serviceNo = await nextServiceNo();
    const { rows } = await query<{ id: string }>(
      `insert into services (business_id, service_no, category_id, name, description, clothing_category, price, estimated_completion_days, is_available, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active') returning id`,
      [
        businessId,
        serviceNo,
        categoryId,
        name,
        description || null,
        clothing_category || null,
        price,
        estimated_completion_days ?? null,
        is_available,
      ]
    );
    revalidatePath("/admin/services");
    return { ok: true, data: rows[0] };
  } catch (err) {
    console.error("createService failed", err);
    return { ok: false, error: "Could not create service." };
  }
}

export async function updateService(id: string, input: unknown): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, categoryName, description, clothing_category, price, estimated_completion_days, is_available } =
    parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const categoryId = categoryName ? await findOrCreateServiceCategory(categoryName) : null;
    const { rowCount } = await query(
      `update services
       set name = $1, category_id = $2, description = $3, clothing_category = $4,
           price = $5, estimated_completion_days = $6, is_available = $7
       where id = $8 and business_id = $9`,
      [
        name,
        categoryId,
        description || null,
        clothing_category || null,
        price,
        estimated_completion_days ?? null,
        is_available,
        id,
        businessId,
      ]
    );
    if (!rowCount) return { ok: false, error: "Service not found." };
    revalidatePath("/admin/services");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateService failed", err);
    return { ok: false, error: "Could not update service." };
  }
}

export async function listMyServices(): Promise<ServiceRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<ServiceRow>(
    `select s.id, s.service_no, s.name, c.name as category_name, s.description, s.clothing_category,
            s.price, s.estimated_completion_days, s.is_available, s.created_at
     from services s
     left join service_categories c on c.id = s.category_id
     where s.business_id = $1
     order by s.created_at desc`,
    [businessId]
  );
  return rows;
}

export async function setServiceAvailable(id: string, isAvailable: boolean): Promise<ActionResult> {
  try {
    const businessId = await getCurrentBusinessId();
    await query(`update services set is_available = $1 where id = $2 and business_id = $3`, [
      isAvailable,
      id,
      businessId,
    ]);
    revalidatePath("/admin/services");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("setServiceAvailable failed", err);
    return { ok: false, error: "Could not update service." };
  }
}

// ---------------------------------------------------------------------------
// Public — for storefront pages (doc §6, §8)
// ---------------------------------------------------------------------------
export async function listPublicServices(businessId: string): Promise<ServiceRow[]> {
  const { rows } = await query<ServiceRow>(
    `select s.id, s.service_no, s.name, c.name as category_name, s.description, s.clothing_category,
            s.price, s.estimated_completion_days, s.is_available, s.created_at
     from services s
     left join service_categories c on c.id = s.category_id
     where s.business_id = $1 and s.is_available = true and s.status = 'active'
     order by s.created_at desc`,
    [businessId]
  );
  return rows;
}
