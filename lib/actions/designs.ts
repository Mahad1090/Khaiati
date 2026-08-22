"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";
import { designSchema } from "@/lib/validation/design";
import type { ActionResult } from "./customers";

export type DesignRow = {
  id: string;
  name: string;
  garment_type: string;
  description: string | null;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
};

export async function listDesigns(filters?: {
  garmentType?: string;
  activeOnly?: boolean;
  search?: string;
}): Promise<DesignRow[]> {
  const businessId = await getCurrentBusinessId();
  const conditions: string[] = [];
  const params: unknown[] = [businessId];

  conditions.push(`business_id = $1`);

  if (filters?.garmentType) {
    params.push(filters.garmentType);
    conditions.push(`garment_type = $${params.length}`);
  }
  if (filters?.activeOnly) {
    conditions.push(`is_active = true`);
  }
  if (filters?.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`name ilike $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const { rows } = await query<DesignRow>(
    `select id, name, garment_type, description, image_path, is_active, created_at
     from designs ${where}
     order by created_at desc`,
    params
  );
  return rows;
}

export async function listPublicDesigns(
  businessId: string,
  filters?: { garmentType?: string; activeOnly?: boolean }
): Promise<DesignRow[]> {
  const conditions: string[] = ["business_id = $1"];
  const params: unknown[] = [businessId];

  if (filters?.garmentType) {
    params.push(filters.garmentType);
    conditions.push(`garment_type = $${params.length}`);
  }
  if (filters?.activeOnly !== false) {
    conditions.push(`is_active = true`);
  }

  const where = `where ${conditions.join(" and ")}`;
  const { rows } = await query<DesignRow>(
    `select id, name, garment_type, description, image_path, is_active, created_at
     from designs ${where}
     order by created_at desc`,
    params
  );
  return rows;
}

export async function createDesign(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = designSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, garment_type, description, image_path, is_active } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const { rows } = await query<{ id: string }>(
      `insert into designs (business_id, name, garment_type, description, image_path, is_active)
       values ($1, $2, $3, $4, $5, $6) returning id`,
      [businessId, name, garment_type, description || null, image_path || null, is_active]
    );
    revalidatePath("/admin/designs");
    return { ok: true, data: rows[0] };
  } catch (err) {
    console.error("createDesign failed", err);
    return { ok: false, error: "Could not create design. Please try again." };
  }
}

export async function updateDesign(id: string, input: unknown): Promise<ActionResult> {
  const parsed = designSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, garment_type, description, image_path, is_active } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const { rowCount } = await query(
      `update designs
       set name = $1, garment_type = $2, description = $3, image_path = $4, is_active = $5
       where id = $6 and business_id = $7`,
      [name, garment_type, description || null, image_path || null, is_active, id, businessId]
    );
    if (!rowCount) {
      return { ok: false, error: "Design not found." };
    }
    revalidatePath("/admin/designs");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateDesign failed", err);
    return { ok: false, error: "Could not update design. Please try again." };
  }
}

export async function setDesignActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const businessId = await getCurrentBusinessId();
    await query(`update designs set is_active = $1 where id = $2 and business_id = $3`, [isActive, id, businessId]);
    revalidatePath("/admin/designs");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("setDesignActive failed", err);
    return { ok: false, error: "Could not update design status." };
  }
}
