"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";
import { productSchema, slugifyCategory } from "@/lib/validation/marketplace";
import type { ActionResult } from "./customers";

async function nextProductNo() {
  const { rows } = await query<{ next: number }>(`select nextval('product_no_seq')::int as next`);
  return `P-${String(rows[0].next).padStart(4, "0")}`;
}

async function findOrCreateProductCategory(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugifyCategory(trimmed);
  const existing = await query<{ id: string }>(`select id from product_categories where slug = $1`, [slug]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const { rows } = await query<{ id: string }>(
    `insert into product_categories (name, slug) values ($1, $2)
     on conflict (slug) do update set name = excluded.name
     returning id`,
    [trimmed, slug]
  );
  return rows[0].id;
}

export type ProductRow = {
  id: string;
  product_no: string;
  name: string;
  category_name: string | null;
  description: string | null;
  fabric_type: string | null;
  color: string | null;
  price: string;
  stock_quantity: string;
  is_available: boolean;
  created_at: string;
};

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, categoryName, description, fabric_type, color, price, stock_quantity, is_available } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const categoryId = categoryName ? await findOrCreateProductCategory(categoryName) : null;
    const productNo = await nextProductNo();
    const { rows } = await query<{ id: string }>(
      `insert into products (business_id, product_no, category_id, name, description, fabric_type, color, price, stock_quantity, is_available, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active') returning id`,
      [businessId, productNo, categoryId, name, description || null, fabric_type || null, color || null, price, stock_quantity, is_available]
    );
    revalidatePath("/admin/products");
    return { ok: true, data: rows[0] };
  } catch (err) {
    console.error("createProduct failed", err);
    return { ok: false, error: "Could not create product." };
  }
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, categoryName, description, fabric_type, color, price, stock_quantity, is_available } = parsed.data;
  try {
    const businessId = await getCurrentBusinessId();
    const categoryId = categoryName ? await findOrCreateProductCategory(categoryName) : null;
    const { rowCount } = await query(
      `update products
       set name = $1, category_id = $2, description = $3, fabric_type = $4, color = $5,
           price = $6, stock_quantity = $7, is_available = $8
       where id = $9 and business_id = $10`,
      [name, categoryId, description || null, fabric_type || null, color || null, price, stock_quantity, is_available, id, businessId]
    );
    if (!rowCount) return { ok: false, error: "Product not found." };
    revalidatePath("/admin/products");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateProduct failed", err);
    return { ok: false, error: "Could not update product." };
  }
}

export async function listMyProducts(): Promise<ProductRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<ProductRow>(
    `select p.id, p.product_no, p.name, c.name as category_name, p.description, p.fabric_type, p.color,
            p.price, p.stock_quantity, p.is_available, p.created_at
     from products p
     left join product_categories c on c.id = p.category_id
     where p.business_id = $1
     order by p.created_at desc`,
    [businessId]
  );
  return rows;
}

export async function setProductAvailable(id: string, isAvailable: boolean): Promise<ActionResult> {
  try {
    const businessId = await getCurrentBusinessId();
    await query(`update products set is_available = $1 where id = $2 and business_id = $3`, [
      isAvailable,
      id,
      businessId,
    ]);
    revalidatePath("/admin/products");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("setProductAvailable failed", err);
    return { ok: false, error: "Could not update product." };
  }
}

// ---------------------------------------------------------------------------
// Public — for storefront pages (doc §6-7)
// ---------------------------------------------------------------------------
export async function listPublicProducts(businessId: string): Promise<ProductRow[]> {
  const { rows } = await query<ProductRow>(
    `select p.id, p.product_no, p.name, c.name as category_name, p.description, p.fabric_type, p.color,
            p.price, p.stock_quantity, p.is_available, p.created_at
     from products p
     left join product_categories c on c.id = p.category_id
     where p.business_id = $1 and p.is_available = true and p.status = 'active'
     order by p.created_at desc`,
    [businessId]
  );
  return rows;
}
