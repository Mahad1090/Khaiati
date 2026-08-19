"use server";

import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/lib/db";
import { customerSchema } from "@/lib/validation/customer";
import { getCurrentBusinessId } from "@/lib/auth/business-context";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function nextCustomerNo(client: { query: typeof query }) {
  const { rows } = await client.query<{ next: number }>(
    `select nextval('customer_no_seq')::int as next`
  );
  return `C-${String(rows[0].next).padStart(4, "0")}`;
}

// Customers are a single shared marketplace identity (doc §3, §11), not owned
// by one business — createCustomer/searchCustomers/getCustomerById stay
// global on purpose. What's business-scoped is a customer's *order history*
// with a given business (see getCustomerDetail/getCustomerOrderHistory below)
// and the business_customers relationship row created in orders.createOrder().
export async function createCustomer(
  input: unknown
): Promise<ActionResult<{ id: string; customer_no: string }>> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, phone, note } = parsed.data;

  try {
    const result = await withTransaction(async (client) => {
      const existing = await client.query<{ id: string }>(
        `select id from customers where phone = $1`,
        [phone]
      );
      if (existing.rows.length > 0) {
        throw new Error("DUPLICATE_PHONE");
      }
      const customerNo = await nextCustomerNo(client);
      const { rows } = await client.query<{ id: string; customer_no: string }>(
        `insert into customers (customer_no, name, phone, note)
         values ($1, $2, $3, $4)
         returning id, customer_no`,
        [customerNo, name, phone, note || null]
      );
      return rows[0];
    });
    revalidatePath("/admin/customers");
    return { ok: true, data: result };
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE_PHONE") {
      return {
        ok: false,
        error: "A customer with this phone number already exists.",
      };
    }
    console.error("createCustomer failed", err);
    return { ok: false, error: "Could not create customer. Please try again." };
  }
}

export async function updateCustomer(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, phone, note } = parsed.data;

  try {
    const dupe = await query<{ id: string }>(
      `select id from customers where phone = $1 and id <> $2`,
      [phone, id]
    );
    if (dupe.rows.length > 0) {
      return {
        ok: false,
        error: "Another customer already uses this phone number.",
      };
    }
    await query(
      `update customers set name = $1, phone = $2, note = $3 where id = $4`,
      [name, phone, note || null, id]
    );
    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${id}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateCustomer failed", err);
    return { ok: false, error: "Could not update customer. Please try again." };
  }
}

export type CustomerRow = {
  id: string;
  customer_no: string;
  name: string;
  phone: string;
  note: string | null;
  created_at: string;
};

export async function getCustomerById(id: string): Promise<CustomerRow | null> {
  const { rows } = await query<CustomerRow>(
    `select id, customer_no, name, phone, note, created_at from customers where id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function searchCustomers(term: string): Promise<CustomerRow[]> {
  const trimmed = term.trim();
  if (!trimmed) {
    const { rows } = await query<CustomerRow>(
      `select id, customer_no, name, phone, note, created_at
       from customers order by created_at desc limit 50`
    );
    return rows;
  }
  const { rows } = await query<CustomerRow>(
    `select id, customer_no, name, phone, note, created_at
     from customers
     where customer_no ilike $1 or name ilike $1 or phone ilike $1
     order by created_at desc
     limit 50`,
    [`%${trimmed}%`]
  );
  return rows;
}

export type CustomerDetail = CustomerRow & {
  totalOrders: number;
  totalPaid: number;
  totalBilled: number;
  outstandingBalance: number;
};

export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<CustomerRow>(
    `select id, customer_no, name, phone, note, created_at from customers where id = $1`,
    [id]
  );
  const customer = rows[0];
  if (!customer) return null;

  // Scoped to this business's own orders with the customer — a customer's
  // identity is shared across the marketplace, but their order/payment
  // history with one business must never be visible to another (doc §34).
  const { rows: totals } = await query<{
    total_orders: string;
    total_billed: string;
    total_paid: string;
  }>(
    `select
       count(distinct o.id)::int as total_orders,
       coalesce(sum(oi.total_price), 0) as total_billed,
       coalesce((select sum(amount) from order_payments p
                 join orders o2 on o2.id = p.order_id
                 where o2.customer_id = $1 and o2.business_id = $2), 0) as total_paid
     from orders o
     left join order_items oi on oi.order_id = o.id
     where o.customer_id = $1 and o.business_id = $2`,
    [id, businessId]
  );

  const totalBilled = Number(totals[0]?.total_billed ?? 0);
  const totalPaid = Number(totals[0]?.total_paid ?? 0);

  return {
    ...customer,
    totalOrders: Number(totals[0]?.total_orders ?? 0),
    totalBilled,
    totalPaid,
    outstandingBalance: totalBilled - totalPaid,
  };
}

export type CustomerOrderHistoryRow = {
  id: string;
  order_no: string;
  status: string;
  order_date: string;
  due_date: string | null;
  total_price: string;
  paid_amount: string;
  garment_types: string[];
};

export async function getCustomerOrderHistory(
  customerId: string
): Promise<CustomerOrderHistoryRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<CustomerOrderHistoryRow>(
    `select
       o.id, o.order_no, o.status, o.order_date, o.due_date,
       coalesce((select sum(total_price) from order_items where order_id = o.id), 0) as total_price,
       coalesce((select sum(amount) from order_payments where order_id = o.id), 0) as paid_amount,
       coalesce((select array_agg(garment_type) from order_items where order_id = o.id), '{}') as garment_types
     from orders o
     where o.customer_id = $1 and o.business_id = $2
     order by o.created_at desc`,
    [customerId, businessId]
  );
  return rows;
}
