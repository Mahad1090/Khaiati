"use server";

import { query } from "@/lib/db";
import { inquirySchema, newsletterSchema } from "@/lib/validation/public-site";
import type { ActionResult } from "@/lib/actions/customers";

export async function submitInquiry(input: unknown): Promise<ActionResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { name, phone, garment_type, message } = parsed.data;
  try {
    await query(
      `insert into contact_inquiries (name, phone, garment_type, message)
       values ($1, $2, $3, $4)`,
      [name, phone, garment_type || null, message || null]
    );
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("submitInquiry failed", err);
    return {
      ok: false,
      error: "Could not send your request right now. Please try again shortly.",
    };
  }
}

export async function subscribeNewsletter(input: unknown): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  }
  try {
    await query(
      `insert into newsletter_subscribers (email) values ($1)
       on conflict (email) do nothing`,
      [parsed.data.email]
    );
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("subscribeNewsletter failed", err);
    return { ok: false, error: "Could not subscribe right now. Please try again shortly." };
  }
}
