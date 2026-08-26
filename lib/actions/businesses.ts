"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentBusinessId, requireOwner, requireAdministrator } from "@/lib/auth/business-context";
import { createNotification } from "./notifications";
import {
  businessRegistrationSchema,
  businessProfileSchema,
  slugify,
  type BusinessStatus,
} from "@/lib/validation/business";
import type { ActionResult } from "./customers";

async function nextBusinessNo() {
  const { rows } = await query<{ next: number }>(`select nextval('business_no_seq')::int as next`);
  return `B-${String(rows[0].next).padStart(4, "0")}`;
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "business";
  let candidate = base;
  let suffix = 1;
  // Small table, small race window — good enough without a transaction here.
  while (true) {
    const { rows } = await query<{ id: string }>(`select id from businesses where slug = $1`, [candidate]);
    if (rows.length === 0) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function registerBusiness(
  input: unknown
): Promise<ActionResult<{ id: string; businessNo: string; accountCreated: boolean }>> {
  const parsed = businessRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { name, ownerName, contactEmail, contactPhone, password, location, description } = parsed.data;

  try {
    const businessNo = await nextBusinessNo();
    const slug = await uniqueSlug(name);
    const { rows } = await query<{ id: string }>(
      `insert into businesses
         (business_no, name, slug, owner_name, contact_email, contact_phone, location, description, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       returning id`,
      [businessNo, name, slug, ownerName, contactEmail, contactPhone, location, description || null]
    );
    const businessId = rows[0].id;

    // Create the owner's sign-in account, if Supabase Auth is configured.
    // Registration still succeeds without it — the business just has no
    // login yet, same honest-fallback pattern used elsewhere in the app.
    let accountCreated = false;
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: contactEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: ownerName },
      });
      if (userError) {
        console.error("registerBusiness: could not create owner account", userError);
      } else if (userData.user) {
        await query(
          `insert into user_profiles (id, full_name, role, business_id, is_owner)
           values ($1, $2, 'manager', $3, true)
           on conflict (id) do update set business_id = excluded.business_id, is_owner = true`,
          [userData.user.id, ownerName, businessId]
        );
        await query(`update businesses set owner_user_id = $1 where id = $2`, [userData.user.id, businessId]);
        accountCreated = true;
      }
    }

    revalidatePath("/admin/businesses");
    return { ok: true, data: { id: businessId, businessNo, accountCreated } };
  } catch (err) {
    console.error("registerBusiness failed", err);
    return { ok: false, error: "Could not submit your registration. Please try again." };
  }
}

export type BusinessRow = {
  id: string;
  business_no: string;
  name: string;
  slug: string;
  owner_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  description: string | null;
  status: BusinessStatus;
  created_at: string;
};

export async function listBusinesses(filters?: {
  status?: BusinessStatus;
  search?: string;
}): Promise<BusinessRow[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filters?.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`(name ilike $${params.length} or owner_name ilike $${params.length} or business_no ilike $${params.length})`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const { rows } = await query<BusinessRow>(
    `select id, business_no, name, slug, owner_name, contact_email, contact_phone, location, description, status, created_at
     from businesses ${where}
     order by created_at desc`,
    params
  );
  return rows;
}

export async function getBusinessCounts(): Promise<Record<BusinessStatus, number>> {
  const { rows } = await query<{ status: BusinessStatus; count: string }>(
    `select status, count(*)::text from businesses group by status`
  );
  const counts: Record<BusinessStatus, number> = { pending: 0, approved: 0, rejected: 0, suspended: 0 };
  for (const row of rows) counts[row.status] = Number(row.count);
  return counts;
}

// ---------------------------------------------------------------------------
// Public discovery (doc §5-6) — only ever returns approved businesses.
// ---------------------------------------------------------------------------
export type PublicBusinessRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location: string | null;
  contact_phone: string | null;
  contact_email: string | null;
};

export async function listApprovedBusinesses(search?: string): Promise<PublicBusinessRow[]> {
  const params: unknown[] = [];
  let extra = "";
  if (search?.trim()) {
    params.push(`%${search.trim()}%`);
    extra = `and (name ilike $1 or location ilike $1)`;
  }
  const { rows } = await query<PublicBusinessRow>(
    `select id, slug, name, description, location, contact_phone, contact_email
     from businesses
     where status = 'approved' ${extra}
     order by created_at desc
     limit 50`,
    params
  );
  return rows;
}

export async function getApprovedBusinessBySlug(slug: string): Promise<PublicBusinessRow | null> {
  const { rows } = await query<PublicBusinessRow>(
    `select id, slug, name, description, location, contact_phone, contact_email
     from businesses where slug = $1 and status = 'approved'`,
    [slug]
  );
  return rows[0] ?? null;
}

// Self-service — always operates on the signed-in user's own business,
// never a caller-supplied id, so one business's staff can never edit
// another's profile no matter what a client sends.
export async function getMyBusinessProfile(): Promise<BusinessRow | null> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<BusinessRow>(
    `select id, business_no, name, slug, owner_name, contact_email, contact_phone, location, description, status, created_at
     from businesses where id = $1`,
    [businessId]
  );
  return rows[0] ?? null;
}

export async function updateMyBusinessProfile(input: unknown): Promise<ActionResult> {
  const parsed = businessProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { name, contactEmail, contactPhone, location, description } = parsed.data;
  try {
    await requireOwner();
  } catch {
    return { ok: false, error: "Only the business owner can edit the business profile." };
  }
  try {
    const businessId = await getCurrentBusinessId();
    await query(
      `update businesses
       set name = $1, contact_email = $2, contact_phone = $3, location = $4, description = $5
       where id = $6`,
      [name, contactEmail, contactPhone, location, description || null, businessId]
    );
    revalidatePath("/admin/business-profile");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateMyBusinessProfile failed", err);
    return { ok: false, error: "Could not update your business profile." };
  }
}

export async function updateBusinessStatus(id: string, status: BusinessStatus): Promise<ActionResult> {
  try {
    await requireAdministrator();
  } catch {
    return { ok: false, error: "Only an administrator can approve, reject, or suspend businesses." };
  }
  try {
    const { rows } = await query<{ owner_user_id: string | null; name: string }>(
      `update businesses set status = $1 where id = $2 returning owner_user_id, name`,
      [status, id]
    );
    if (rows[0]?.owner_user_id) {
      const messages: Partial<Record<BusinessStatus, string>> = {
        approved: `${rows[0].name} has been approved and is now live on Khaiati.`,
        rejected: `${rows[0].name}'s application was not approved.`,
        suspended: `${rows[0].name} has been suspended.`,
      };
      const message = messages[status];
      if (message) {
        await createNotification(rows[0].owner_user_id, "business_status", "Business Status Updated", message);
      }
    }
    revalidatePath("/admin/businesses");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateBusinessStatus failed", err);
    return { ok: false, error: "Could not update business status." };
  }
}
