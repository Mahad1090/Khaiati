"use server";

import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/lib/db";
import { getCurrentCustomer } from "./customer-auth";
import { customerOrderRequestSchema } from "@/lib/validation/customer-order";
import type { ActionResult } from "./customers";

async function nextOrderNo(client: { query: typeof query }) {
  const year = new Date().getFullYear();
  const { rows } = await client.query<{ next: number }>(`select nextval('order_no_seq')::int as next`);
  return `KHA-${year}-${String(rows[0].next).padStart(6, "0")}`;
}

/**
 * Customer-initiated order request (doc §9, §26-27 — simplified: no
 * multi-item cart, one product or service per request). Measurements are
 * taken by the business when they process the order, same as how a
 * walk-in customer's measurements are taken — not collected on this public
 * form, to keep the storefront request simple.
 */
export async function requestServiceOrder(
  serviceId: string,
  input: unknown
): Promise<ActionResult<{ orderNo: string }>> {
  const parsed = customerOrderRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { ok: false, error: "Please sign in to request an order." };
  }
  const { quantity, delivery_option, note } = parsed.data;

  try {
    const result = await withTransaction(async (client) => {
      const { rows: svcRows } = await client.query<{
        business_id: string;
        clothing_category: string | null;
        price: string;
      }>(`select business_id, clothing_category, price from services where id = $1 and is_available = true`, [
        serviceId,
      ]);
      if (svcRows.length === 0) throw new Error("NOT_FOUND");
      const service = svcRows[0];
      const garmentType = service.clothing_category || "shirt";
      const totalPrice = Math.round(Number(service.price) * quantity * 100) / 100;

      const orderNo = await nextOrderNo(client);
      const { rows: orderRows } = await client.query<{ id: string }>(
        `insert into orders (order_no, business_id, customer_id, status, order_date, note, order_kind, delivery_option)
         values ($1, $2, $3, 'new_order', current_date, $4, 'stitching', $5)
         returning id`,
        [orderNo, service.business_id, customer.id, note || null, delivery_option]
      );
      const orderId = orderRows[0].id;

      await client.query(
        `insert into order_items (order_id, garment_type, service_id, quantity, price_per_piece, total_price, note)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, garmentType, serviceId, quantity, service.price, totalPrice, note || null]
      );

      await client.query(
        `insert into business_customers (business_id, customer_id) values ($1, $2)
         on conflict (business_id, customer_id) do nothing`,
        [service.business_id, customer.id]
      );

      return { orderNo };
    });

    revalidatePath("/account");
    return { ok: true, data: result };
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return { ok: false, error: "This service is no longer available." };
    }
    console.error("requestServiceOrder failed", err);
    return { ok: false, error: "Could not submit your order request. Please try again." };
  }
}

export async function requestProductOrder(
  productId: string,
  input: unknown
): Promise<ActionResult<{ orderNo: string }>> {
  const parsed = customerOrderRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { ok: false, error: "Please sign in to request an order." };
  }
  const { quantity, delivery_option, note } = parsed.data;

  try {
    const result = await withTransaction(async (client) => {
      const { rows: prodRows } = await client.query<{
        business_id: string;
        price: string;
        stock_quantity: string;
      }>(
        `select business_id, price, stock_quantity from products where id = $1 and is_available = true`,
        [productId]
      );
      if (prodRows.length === 0) throw new Error("NOT_FOUND");
      const product = prodRows[0];
      if (Number(product.stock_quantity) < quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }
      const totalPrice = Math.round(Number(product.price) * quantity * 100) / 100;

      const orderNo = await nextOrderNo(client);
      const { rows: orderRows } = await client.query<{ id: string }>(
        `insert into orders (order_no, business_id, customer_id, status, order_date, note, order_kind, delivery_option)
         values ($1, $2, $3, 'new_order', current_date, $4, 'product', $5)
         returning id`,
        [orderNo, product.business_id, customer.id, note || null, delivery_option]
      );
      const orderId = orderRows[0].id;

      // garment_type is NOT NULL on order_items even for a plain fabric/product
      // purchase with no stitching attached — 'shirt' is a placeholder default,
      // not a real garment selection, since this schema was designed around
      // every order item being a garment. Revisit if product-only orders
      // become common enough to warrant a nullable garment_type.
      await client.query(
        `insert into order_items (order_id, garment_type, product_id, quantity, price_per_piece, total_price, note)
         values ($1, 'shirt', $2, $3, $4, $5, $6)`,
        [orderId, productId, quantity, product.price, totalPrice, note || null]
      );

      await client.query(`update products set stock_quantity = stock_quantity - $1 where id = $2`, [
        quantity,
        productId,
      ]);
      await client.query(
        `insert into product_stock_movements (product_id, movement_type, quantity, reference_id, note)
         values ($1, 'sale', $2, $3, $4)`,
        [productId, -quantity, orderId, `Order ${orderNo}`]
      );

      await client.query(
        `insert into business_customers (business_id, customer_id) values ($1, $2)
         on conflict (business_id, customer_id) do nothing`,
        [product.business_id, customer.id]
      );

      return { orderNo };
    });

    revalidatePath("/account");
    return { ok: true, data: result };
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return { ok: false, error: "This product is no longer available." };
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
      return { ok: false, error: "Not enough stock available." };
    }
    console.error("requestProductOrder failed", err);
    return { ok: false, error: "Could not submit your order request. Please try again." };
  }
}
