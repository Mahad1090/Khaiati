"use server";

import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/lib/db";
import { orderSchema, orderStatuses, orderStatusLabels, type OrderStatus } from "@/lib/validation/order";
import { getCurrentBusinessId, requireCapability } from "@/lib/auth/business-context";
import { createNotification } from "./notifications";
import type { ActionResult } from "./customers";

async function nextOrderNo(client: { query: typeof query }) {
  const year = new Date().getFullYear();
  const { rows } = await client.query<{ next: number }>(
    `select nextval('order_no_seq')::int as next`
  );
  return `KHA-${year}-${String(rows[0].next).padStart(6, "0")}`;
}

export async function createOrder(
  input: unknown
): Promise<ActionResult<{ id: string; order_no: string }>> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { customer_id, order_date, due_date, note, items, paid_amount, order_kind, delivery_option } = parsed.data;

  // Financial integrity: total is computed server-side, never trusted from the client.
  const totalPrice = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.price_per_piece * 100) / 100,
    0
  );
  if (paid_amount > totalPrice) {
    return { ok: false, error: "Paid amount cannot exceed the order total." };
  }

  try {
    const businessId = await getCurrentBusinessId();
    const result = await withTransaction(async (client) => {
      const customerExists = await client.query<{ id: string }>(
        `select id from customers where id = $1`,
        [customer_id]
      );
      if (customerExists.rows.length === 0) {
        throw new Error("INVALID_CUSTOMER");
      }

      const orderNo = await nextOrderNo(client);
      const { rows: orderRows } = await client.query<{ id: string; order_no: string }>(
        `insert into orders (order_no, business_id, customer_id, status, order_date, due_date, note, order_kind, delivery_option)
         values ($1, $2, $3, 'new_order', $4, $5, $6, $7, $8)
         returning id, order_no`,
        [orderNo, businessId, customer_id, order_date, due_date || null, note || null, order_kind, delivery_option]
      );
      const order = orderRows[0];

      // Record that this business has served this customer (doc §11).
      await client.query(
        `insert into business_customers (business_id, customer_id) values ($1, $2)
         on conflict (business_id, customer_id) do nothing`,
        [businessId, customer_id]
      );

      for (const item of items) {
        const itemTotal = Math.round(item.quantity * item.price_per_piece * 100) / 100;
        const { rows: itemRows } = await client.query<{ id: string }>(
          `insert into order_items
             (order_id, garment_type, design_id, quantity, price_per_piece, total_price, note)
           values ($1, $2, $3, $4, $5, $6, $7)
           returning id`,
          [
            order.id,
            item.garment_type,
            item.design_id || null,
            item.quantity,
            item.price_per_piece,
            itemTotal,
            item.note || null,
          ]
        );
        const itemId = itemRows[0].id;

        const m = item.measurements;
        await client.query(
          `insert into garment_measurements
             (order_item_id, height, sleeve, shoulder, neck, armhole, armpit, chest, waist, hip, inseam, note)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            itemId,
            m.height ?? null,
            m.sleeve ?? null,
            m.shoulder ?? null,
            m.neck ?? null,
            m.armhole ?? null,
            m.armpit ?? null,
            m.chest ?? null,
            m.waist ?? null,
            m.hip ?? null,
            m.inseam ?? null,
            m.note || null,
          ]
        );
      }

      if (paid_amount > 0) {
        await client.query(
          `insert into order_payments (order_id, amount, paid_at, note)
           values ($1, $2, $3, $4)`,
          [order.id, paid_amount, order_date, "Initial payment"]
        );
      }

      return order;
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/customers/${customer_id}`);
    return { ok: true, data: result };
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CUSTOMER") {
      return { ok: false, error: "Selected customer does not exist." };
    }
    console.error("createOrder failed", err);
    return { ok: false, error: "Could not create order. Please try again." };
  }
}

export async function addOrderPayment(
  orderId: string,
  amount: number,
  note?: string
): Promise<ActionResult> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid payment amount." };
  }
  try {
    const businessId = await getCurrentBusinessId();
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query<{ total: string; paid: string; business_id: string }>(
        `select
           coalesce((select sum(total_price) from order_items where order_id = o.id), 0) as total,
           coalesce((select sum(amount) from order_payments where order_id = o.id), 0) as paid,
           o.business_id
         from orders o
         where o.id = $1`,
        [orderId]
      );
      if (rows.length === 0 || rows[0].business_id !== businessId) {
        throw new Error("NOT_FOUND");
      }
      const total = Number(rows[0].total);
      const paid = Number(rows[0].paid);
      if (paid + amount > total) {
        throw new Error("OVERPAYMENT");
      }
      await client.query(
        `insert into order_payments (order_id, amount, note) values ($1, $2, $3)`,
        [orderId, amount, note || null]
      );
    });
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "OVERPAYMENT") {
      return { ok: false, error: "Payment would exceed the remaining balance." };
    }
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return { ok: false, error: "Order not found." };
    }
    console.error("addOrderPayment failed", err);
    return { ok: false, error: "Could not record payment." };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  if (!orderStatuses.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  try {
    // Progressing an order's stage (this is what the /track/[token] page
    // reads live) — Manager and Employee handle this; Storekeeper/Accountant do not.
    await requireCapability("orders:edit");
  } catch {
    return { ok: false, error: "You don't have permission to update order status." };
  }
  try {
    const businessId = await getCurrentBusinessId();
    const { rows } = await query<{ order_no: string; customer_user_id: string | null }>(
      `update orders o set status = $1
       from customers c
       where o.id = $2 and o.business_id = $3 and c.id = o.customer_id
       returning o.order_no, c.user_id as customer_user_id`,
      [status, orderId, businessId]
    );
    if (rows.length === 0) {
      return { ok: false, error: "Order not found." };
    }
    if (rows[0].customer_user_id) {
      await createNotification(
        rows[0].customer_user_id,
        "order_status",
        `Order ${rows[0].order_no} updated`,
        `Status: ${orderStatusLabels[status]}`
      );
    }
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateOrderStatus failed", err);
    return { ok: false, error: "Could not update order status." };
  }
}

export type OrderListRow = {
  id: string;
  order_no: string;
  status: OrderStatus;
  order_date: string;
  due_date: string | null;
  customer_name: string;
  customer_phone: string;
  total_price: string;
  paid_amount: string;
};

export async function searchOrders(term: string): Promise<OrderListRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = `and (o.order_no ilike $2 or c.name ilike $2 or c.phone ilike $2)`;
  }
  const { rows } = await query<OrderListRow>(
    `select
       o.id, o.order_no, o.status, o.order_date, o.due_date,
       c.name as customer_name, c.phone as customer_phone,
       coalesce((select sum(total_price) from order_items where order_id = o.id), 0) as total_price,
       coalesce((select sum(amount) from order_payments where order_id = o.id), 0) as paid_amount
     from orders o
     join customers c on c.id = o.customer_id
     where o.business_id = $1
     ${extra}
     order by o.created_at desc
     limit 100`,
    params
  );
  return rows;
}

export type OrderDetail = {
  id: string;
  order_no: string;
  status: OrderStatus;
  order_date: string;
  due_date: string | null;
  note: string | null;
  tracking_token: string;
  customer: { id: string; customer_no: string; name: string; phone: string };
  items: Array<{
    id: string;
    garment_type: string;
    design_name: string | null;
    quantity: number;
    price_per_piece: string;
    total_price: string;
    note: string | null;
    measurements: Record<string, string | number | null>;
  }>;
  payments: Array<{ id: string; amount: string; paid_at: string; note: string | null }>;
  totalPrice: number;
  totalPaid: number;
  balance: number;
};

// ---------------------------------------------------------------------------
// Public QR tracking — deliberately returns nothing beyond order number,
// status, dates, and a coarse progress timeline. Never expose customer
// name/phone, pricing, payments, or the internal order id here (doc §25
// security note: the QR page must not leak private customer or business data).
// ---------------------------------------------------------------------------
export type TrackingStage = {
  key: OrderStatus;
  label: string;
  done: boolean;
  active: boolean;
};

const TRACKING_STAGES: { key: OrderStatus; label: string }[] = [
  { key: "new_order", label: "Order Placed" },
  { key: "measurements_taken", label: "Measurements Taken" },
  { key: "submitted_to_scissors", label: "Cutting" },
  { key: "submitted_to_sewing", label: "Stitching" },
  { key: "in_process", label: "Finishing" },
  { key: "completed", label: "Ready" },
  { key: "delivered", label: "Delivered" },
];

export type OrderTrackingInfo = {
  orderNo: string;
  status: OrderStatus;
  statusLabel: string;
  dueDate: string | null;
  lastUpdated: string;
  stages: TrackingStage[];
  canceled: boolean;
};

export async function getOrderTrackingByToken(token: string): Promise<OrderTrackingInfo | null> {
  const { rows } = await query<{
    order_no: string;
    status: OrderStatus;
    due_date: string | null;
    updated_at: string;
  }>(
    `select order_no, status, due_date, updated_at from orders where tracking_token = $1`,
    [token]
  );
  const order = rows[0];
  if (!order) return null;

  const canceled = order.status === "canceled";
  const currentIndex = TRACKING_STAGES.findIndex((s) => s.key === order.status);

  const stages: TrackingStage[] = TRACKING_STAGES.map((stage, index) => ({
    key: stage.key,
    label: stage.label,
    done: !canceled && currentIndex >= 0 && index < currentIndex,
    active: !canceled && index === currentIndex,
  }));

  return {
    orderNo: order.order_no,
    status: order.status,
    statusLabel: orderStatusLabels[order.status],
    dueDate: order.due_date,
    lastUpdated: order.updated_at,
    stages,
    canceled,
  };
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  const businessId = await getCurrentBusinessId();
  const { rows: orderRows } = await query<any>(
    `select o.id, o.order_no, o.status, o.order_date, o.due_date, o.note, o.tracking_token,
            c.id as customer_id, c.customer_no, c.name as customer_name, c.phone as customer_phone
     from orders o
     join customers c on c.id = o.customer_id
     where o.id = $1 and o.business_id = $2`,
    [id, businessId]
  );
  const order = orderRows[0];
  if (!order) return null;

  const { rows: items } = await query<any>(
    `select oi.id, oi.garment_type, oi.quantity, oi.price_per_piece, oi.total_price, oi.note,
            d.name as design_name,
            gm.height, gm.sleeve, gm.shoulder, gm.neck, gm.armhole, gm.armpit,
            gm.chest, gm.waist, gm.hip, gm.inseam, gm.note as measurement_note
     from order_items oi
     left join designs d on d.id = oi.design_id
     left join garment_measurements gm on gm.order_item_id = oi.id
     where oi.order_id = $1
     order by oi.created_at asc`,
    [id]
  );

  const { rows: payments } = await query<any>(
    `select id, amount, paid_at, note from order_payments where order_id = $1 order by paid_at asc`,
    [id]
  );

  const totalPrice = items.reduce((s: number, i: any) => s + Number(i.total_price), 0);
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);

  return {
    id: order.id,
    order_no: order.order_no,
    status: order.status,
    order_date: order.order_date,
    due_date: order.due_date,
    note: order.note,
    tracking_token: order.tracking_token,
    customer: {
      id: order.customer_id,
      customer_no: order.customer_no,
      name: order.customer_name,
      phone: order.customer_phone,
    },
    items: items.map((i: any) => ({
      id: i.id,
      garment_type: i.garment_type,
      design_name: i.design_name,
      quantity: i.quantity,
      price_per_piece: i.price_per_piece,
      total_price: i.total_price,
      note: i.note,
      measurements: {
        height: i.height,
        sleeve: i.sleeve,
        shoulder: i.shoulder,
        neck: i.neck,
        armhole: i.armhole,
        armpit: i.armpit,
        chest: i.chest,
        waist: i.waist,
        hip: i.hip,
        inseam: i.inseam,
        note: i.measurement_note,
      },
    })),
    payments,
    totalPrice,
    totalPaid,
    balance: totalPrice - totalPaid,
  };
}
