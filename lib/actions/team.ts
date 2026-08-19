"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentBusinessId, requireOwner } from "@/lib/auth/business-context";
import { inviteEmployeeSchema } from "@/lib/validation/team";
import type { ActionResult } from "./customers";

export type TeamMemberRow = {
  id: string;
  full_name: string | null;
  is_owner: boolean;
  created_at: string;
};

/** The business's own dashboard-access team — distinct from the Workers
 *  module (shop-floor tailors/cutters); this is who can sign in to `/admin`. */
export async function listMyTeam(): Promise<TeamMemberRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<TeamMemberRow>(
    `select id, full_name, is_owner, created_at from user_profiles
     where business_id = $1 order by created_at asc`,
    [businessId]
  );
  return rows;
}

export async function inviteEmployee(input: unknown): Promise<ActionResult> {
  const parsed = inviteEmployeeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  try {
    await requireOwner();
  } catch {
    return { ok: false, error: "Only the business owner can invite team members." };
  }

  const { name, email, password } = parsed.data;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Team invites aren't configured yet (Supabase service role key missing)." };
  }

  try {
    const businessId = await getCurrentBusinessId();
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
      console.error("inviteEmployee: createUser failed", userError);
      return { ok: false, error: "Could not create the account." };
    }

    await query(
      `insert into user_profiles (id, full_name, role, business_id, is_owner)
       values ($1, $2, 'employee', $3, false)
       on conflict (id) do update set business_id = excluded.business_id, is_owner = false`,
      [userData.user.id, name, businessId]
    );

    revalidatePath("/admin/team");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("inviteEmployee failed", err);
    return { ok: false, error: "Could not invite this team member." };
  }
}
