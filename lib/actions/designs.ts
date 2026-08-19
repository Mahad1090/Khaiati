"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
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
  const conditions: string[] = [];
  const params: unknown[] = [];

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

export async function createDesign(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = designSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, garment_type, description, image_path, is_active } = parsed.data;
  try {
    const { rows } = await query<{ id: string }>(
      `insert into designs (name, garment_type, description, image_path, is_active)
       values ($1, $2, $3, $4, $5) returning id`,
      [name, garment_type, description || null, image_path || null, is_active]
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
    await query(
      `update designs
       set name = $1, garment_type = $2, description = $3, image_path = $4, is_active = $5
       where id = $6`,
      [name, garment_type, description || null, image_path || null, is_active, id]
    );
    revalidatePath("/admin/designs");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateDesign failed", err);
    return { ok: false, error: "Could not update design. Please try again." };
  }
}

export async function setDesignActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await query(`update designs set is_active = $1 where id = $2`, [isActive, id]);
    revalidatePath("/admin/designs");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("setDesignActive failed", err);
    return { ok: false, error: "Could not update design status." };
  }
}
