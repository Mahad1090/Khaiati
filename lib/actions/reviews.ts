"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";
import { getCurrentCustomer } from "./customer-auth";
import { reviewSchema } from "@/lib/validation/review";
import type { ActionResult } from "./customers";

export async function submitReview(orderId: string, input: unknown): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { ok: false, error: "Please sign in to leave a review." };
  }
  try {
    const { rows } = await query<{ business_id: string; status: string }>(
      `select business_id, status from orders where id = $1 and customer_id = $2`,
      [orderId, customer.id]
    );
    if (rows.length === 0) {
      return { ok: false, error: "Order not found." };
    }
    if (!["completed", "delivered"].includes(rows[0].status)) {
      return { ok: false, error: "You can review an order once it's completed." };
    }
    await query(
      `insert into reviews (order_id, business_id, customer_id, rating, comment)
       values ($1, $2, $3, $4, $5)
       on conflict (order_id) do update set rating = excluded.rating, comment = excluded.comment`,
      [orderId, rows[0].business_id, customer.id, parsed.data.rating, parsed.data.comment || null]
    );
    revalidatePath("/account");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("submitReview failed", err);
    return { ok: false, error: "Could not submit your review." };
  }
}

export type ReviewRow = {
  id: string;
  order_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
};

/** Public — approved businesses' published reviews only. */
export async function getPublicReviews(businessId: string): Promise<{ reviews: ReviewRow[]; average: number }> {
  const { rows } = await query<ReviewRow>(
    `select r.id, r.order_id, c.name as customer_name, r.rating, r.comment, r.status, r.created_at
     from reviews r
     join customers c on c.id = r.customer_id
     where r.business_id = $1 and r.status = 'published'
     order by r.created_at desc
     limit 50`,
    [businessId]
  );
  const average = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;
  return { reviews: rows, average };
}

/** Business-facing — their own reviews, including hidden/moderated ones. */
export async function getMyBusinessReviews(): Promise<ReviewRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<ReviewRow>(
    `select r.id, r.order_id, c.name as customer_name, r.rating, r.comment, r.status, r.created_at
     from reviews r
     join customers c on c.id = r.customer_id
     where r.business_id = $1
     order by r.created_at desc`,
    [businessId]
  );
  return rows;
}

export type AllReviewRow = ReviewRow & { business_name: string };

/** Platform admin — every review across every business, for moderation. */
export async function listAllReviews(): Promise<AllReviewRow[]> {
  const { rows } = await query<AllReviewRow>(
    `select r.id, r.order_id, c.name as customer_name, b.name as business_name,
            r.rating, r.comment, r.status, r.created_at
     from reviews r
     join customers c on c.id = r.customer_id
     join businesses b on b.id = r.business_id
     order by r.created_at desc
     limit 200`
  );
  return rows;
}

export async function moderateReview(id: string, status: "published" | "hidden"): Promise<ActionResult> {
  try {
    await query(`update reviews set status = $1 where id = $2`, [status, id]);
    revalidatePath("/admin/reviews");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("moderateReview failed", err);
    return { ok: false, error: "Could not update review." };
  }
}

/** Which of the customer's own completed orders already have a review (for the account page). */
export async function getMyReviewedOrderIds(): Promise<string[]> {
  const customer = await getCurrentCustomer();
  if (!customer) return [];
  const { rows } = await query<{ order_id: string }>(`select order_id from reviews where customer_id = $1`, [
    customer.id,
  ]);
  return rows.map((r) => r.order_id);
}
