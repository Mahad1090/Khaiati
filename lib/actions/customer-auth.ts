"use server";

import { query } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@/lib/supabase/server";
import { customerRegisterSchema } from "@/lib/validation/customer-auth";
import type { ActionResult } from "./customers";

export async function registerCustomerAccount(
  input: unknown
): Promise<ActionResult<{ customerId: string }>> {
  const parsed = customerRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { name, email, phone, password } = parsed.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ok: false,
      error: "Account sign-up isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (userError || !userData.user) {
      if (userError?.message?.toLowerCase().includes("already")) {
        return { ok: false, error: "An account with this email already exists." };
      }
      console.error("registerCustomerAccount: createUser failed", userError);
      return { ok: false, error: "Could not create your account. Please try again." };
    }

    // A customers row may already exist (created by a business staff member
    // serving this person in-store) — link to it by phone instead of
    // creating a duplicate identity.
    const existing = await query<{ id: string }>(`select id from customers where phone = $1`, [phone]);
    let customerId: string;
    if (existing.rows.length > 0) {
      customerId = existing.rows[0].id;
      await query(`update customers set user_id = $1, email = $2 where id = $3`, [
        userData.user.id,
        email,
        customerId,
      ]);
    } else {
      const { rows: noRows } = await query<{ next: number }>(
        `select nextval('customer_no_seq')::int as next`
      );
      const customerNo = `C-${String(noRows[0].next).padStart(4, "0")}`;
      const { rows } = await query<{ id: string }>(
        `insert into customers (customer_no, name, phone, email, user_id)
         values ($1, $2, $3, $4, $5) returning id`,
        [customerNo, name, phone, email, userData.user.id]
      );
      customerId = rows[0].id;
    }

    return { ok: true, data: { customerId } };
  } catch (err) {
    console.error("registerCustomerAccount failed", err);
    return { ok: false, error: "Could not create your account. Please try again." };
  }
}

export type CustomerProfile = {
  id: string;
  customer_no: string;
  name: string;
  phone: string;
  email: string | null;
};

/** Resolves the signed-in customer's own record — never trusts a caller-supplied id. */
export async function getCurrentCustomer(): Promise<CustomerProfile | null> {
  if (!isSupabaseAuthConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { rows } = await query<CustomerProfile>(
      `select id, customer_no, name, phone, email from customers where user_id = $1`,
      [user.id]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export type MyOrderRow = {
  id: string;
  order_no: string;
  business_name: string;
  status: string;
  order_date: string;
  due_date: string | null;
  total_price: string;
  paid_amount: string;
  tracking_token: string;
};

/** A customer's own order history — across every business they've ordered from. */
export async function getMyOrders(): Promise<MyOrderRow[]> {
  const customer = await getCurrentCustomer();
  if (!customer) return [];
  const { rows } = await query<MyOrderRow>(
    `select o.id, o.order_no, b.name as business_name, o.status, o.order_date, o.due_date, o.tracking_token,
            coalesce((select sum(total_price) from order_items where order_id = o.id), 0) as total_price,
            coalesce((select sum(amount) from order_payments where order_id = o.id), 0) as paid_amount
     from orders o
     join businesses b on b.id = o.business_id
     where o.customer_id = $1
     order by o.created_at desc`,
    [customer.id]
  );
  return rows;
}
