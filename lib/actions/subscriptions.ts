"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId, requireOwner } from "@/lib/auth/business-context";
import { planSchema, type PaymentStatus } from "@/lib/validation/subscription";
import type { ActionResult } from "./customers";

// ---------------------------------------------------------------------------
// Platform-admin: manage plans
// ---------------------------------------------------------------------------
export type PlanRow = {
  id: string;
  name: string;
  price: string;
  duration_days: number;
  commission_rate: string;
  is_active: boolean;
  created_at: string;
};

export async function listPlans(): Promise<PlanRow[]> {
  const { rows } = await query<PlanRow>(
    `select id, name, price, duration_days, commission_rate, is_active, created_at
     from subscription_plans order by price asc`
  );
  return rows;
}

export async function createPlan(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, price, duration_days, commission_rate, is_active } = parsed.data;
  try {
    const { rows } = await query<{ id: string }>(
      `insert into subscription_plans (name, price, duration_days, commission_rate, is_active)
       values ($1,$2,$3,$4,$5) returning id`,
      [name, price, duration_days, commission_rate, is_active]
    );
    revalidatePath("/admin/subscription-plans");
    return { ok: true, data: rows[0] };
  } catch (err) {
    console.error("createPlan failed", err);
    return { ok: false, error: "Could not create plan." };
  }
}

export async function setPlanActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await query(`update subscription_plans set is_active = $1 where id = $2`, [isActive, id]);
    revalidatePath("/admin/subscription-plans");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("setPlanActive failed", err);
    return { ok: false, error: "Could not update plan." };
  }
}

// ---------------------------------------------------------------------------
// Platform-admin: view/confirm business subscriptions
// ---------------------------------------------------------------------------
export type SubscriptionRow = {
  id: string;
  business_id: string;
  business_name: string;
  plan_name: string;
  price: string;
  start_date: string;
  expiry_date: string | null;
  payment_status: PaymentStatus;
  renewal_date: string | null;
};

export async function listSubscriptions(): Promise<SubscriptionRow[]> {
  const { rows } = await query<SubscriptionRow>(
    `select bs.id, bs.business_id, b.name as business_name, sp.name as plan_name, sp.price,
            bs.start_date, bs.expiry_date, bs.payment_status, bs.renewal_date
     from business_subscriptions bs
     join businesses b on b.id = bs.business_id
     join subscription_plans sp on sp.id = bs.plan_id
     order by bs.created_at desc`
  );
  return rows;
}

/** Platform admin manually confirms payment — there is no payment gateway wired up (doc §28 leaves the gateway choice open); this is the honest interim: someone verifies payment happened off-platform and marks it here. */
export async function confirmSubscriptionPayment(id: string): Promise<ActionResult> {
  try {
    await query(
      `update business_subscriptions bs
       set payment_status = 'paid',
           start_date = current_date,
           expiry_date = current_date + (sp.duration_days * interval '1 day')
       from subscription_plans sp
       where bs.id = $1 and sp.id = bs.plan_id`,
      [id]
    );
    revalidatePath("/admin/subscription-plans");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("confirmSubscriptionPayment failed", err);
    return { ok: false, error: "Could not confirm payment." };
  }
}

// ---------------------------------------------------------------------------
// Business-facing: request a plan, view current status
// ---------------------------------------------------------------------------
export async function getMySubscription(): Promise<SubscriptionRow | null> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<SubscriptionRow>(
    `select bs.id, bs.business_id, b.name as business_name, sp.name as plan_name, sp.price,
            bs.start_date, bs.expiry_date, bs.payment_status, bs.renewal_date
     from business_subscriptions bs
     join businesses b on b.id = bs.business_id
     join subscription_plans sp on sp.id = bs.plan_id
     where bs.business_id = $1
     order by bs.created_at desc
     limit 1`,
    [businessId]
  );
  return rows[0] ?? null;
}

export async function requestPlan(planId: string): Promise<ActionResult> {
  try {
    await requireOwner();
  } catch {
    return { ok: false, error: "Only the business owner can manage the subscription." };
  }
  try {
    const businessId = await getCurrentBusinessId();
    await query(
      `insert into business_subscriptions (business_id, plan_id, payment_status)
       values ($1, $2, 'pending')`,
      [businessId, planId]
    );
    revalidatePath("/admin/subscription");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("requestPlan failed", err);
    return { ok: false, error: "Could not request this plan." };
  }
}
