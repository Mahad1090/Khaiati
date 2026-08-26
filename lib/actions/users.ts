"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdministrator } from "@/lib/auth/business-context";
import { inviteAdministratorSchema } from "@/lib/validation/admin-users";
import type { Role } from "@/lib/permissions";
import type { ActionResult } from "./customers";

export type UserProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
};

/** Reads real rows from user_profiles (populated once Supabase Auth creates accounts). */
export async function listUserProfiles(): Promise<UserProfileRow[]> {
  const { rows } = await query<UserProfileRow>(
    `select id, full_name, email, role, is_active, created_at
     from user_profiles
     order by created_at desc`
  );
  return rows;
}

/**
 * The platform Administrator adding another Administrator ("sub
 * administrator"). Sub-admins get the full administrator capability set
 * (per lib/permissions.ts) — they are not scoped to any single business
 * (business_id stays null), same as the inviting admin.
 */
export async function createSubAdministrator(input: unknown): Promise<ActionResult> {
  const parsed = inviteAdministratorSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  try {
    await requireAdministrator();
  } catch {
    return { ok: false, error: "Only an administrator can add another administrator." };
  }

  const { name, email, password } = parsed.data;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Adding administrators isn't configured yet (Supabase service role key missing)." };
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
      console.error("createSubAdministrator: createUser failed", userError);
      return { ok: false, error: "Could not create the account." };
    }

    await query(
      `insert into user_profiles (id, full_name, email, role, business_id, is_owner)
       values ($1, $2, $3, 'administrator', null, false)
       on conflict (id) do update set role = 'administrator', business_id = null, email = excluded.email`,
      [userData.user.id, name, email]
    );

    revalidatePath("/admin/users");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("createSubAdministrator failed", err);
    return { ok: false, error: "Could not add this administrator." };
  }
}
