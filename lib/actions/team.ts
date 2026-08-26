"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentBusinessId, requireOwner } from "@/lib/auth/business-context";
import { inviteEmployeeSchema, type InviteableTeamRole } from "@/lib/validation/team";
import type { Role } from "@/lib/permissions";
import type { ActionResult } from "./customers";

export type TeamMemberRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  is_owner: boolean;
  created_at: string;
};

/** The business's own dashboard-access team — distinct from the Workers
 *  module (shop-floor tailors/cutters); this is who can sign in to `/admin`. */
export async function listMyTeam(): Promise<TeamMemberRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<TeamMemberRow>(
    `select id, full_name, email, role, is_owner, created_at from user_profiles
     where business_id = $1 order by is_owner desc, created_at asc`,
    [businessId]
  );
  return rows;
}

// A store may have at most one active Storekeeper and one active
// Accountant (the Manager/owner seat is unique by construction — it's set
// when the business is registered/approved). Workers ("employee" role)
// are unlimited.
const SINGLE_SEAT_ROLES: InviteableTeamRole[] = ["storekeeper", "accountant"];

async function seatAlreadyTaken(businessId: string, role: InviteableTeamRole): Promise<boolean> {
  if (!SINGLE_SEAT_ROLES.includes(role)) return false;
  const { rows } = await query<{ count: string }>(
    `select count(*)::text as count from user_profiles
     where business_id = $1 and role = $2 and is_active`,
    [businessId, role]
  );
  return Number(rows[0]?.count ?? 0) > 0;
}

const ROLE_TAKEN_MESSAGE: Record<string, string> = {
  storekeeper: "This store already has a storekeeper. Remove them first before adding another.",
  accountant: "This store already has an accountant. Remove them first before adding another.",
};

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

  const { name, email, password, role } = parsed.data;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Team invites aren't configured yet (Supabase service role key missing)." };
  }

  try {
    const businessId = await getCurrentBusinessId();

    if (await seatAlreadyTaken(businessId, role)) {
      return { ok: false, error: ROLE_TAKEN_MESSAGE[role] ?? "That role is already filled for this store." };
    }

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
      `insert into user_profiles (id, full_name, email, role, business_id, is_owner)
       values ($1, $2, $3, $4, $5, false)
       on conflict (id) do update set business_id = excluded.business_id, role = excluded.role, email = excluded.email, is_owner = false`,
      [userData.user.id, name, email, role, businessId]
    );

    revalidatePath("/admin/team");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("inviteEmployee failed", err);
    // The unique partial index (0015_role_hierarchy.sql) is the last line of
    // defense against a race between two concurrent invites for the same seat.
    if (err instanceof Error && err.message.includes("uq_user_profiles_one")) {
      return { ok: false, error: ROLE_TAKEN_MESSAGE[role] ?? "That role is already filled for this store." };
    }
    return { ok: false, error: "Could not invite this team member." };
  }
}

export async function removeTeamMember(userId: string): Promise<ActionResult> {
  try {
    await requireOwner();
  } catch {
    return { ok: false, error: "Only the business owner can remove team members." };
  }
  try {
    const businessId = await getCurrentBusinessId();
    // Deactivating (rather than deleting) frees up the storekeeper/accountant
    // seat for a replacement while keeping the account's history intact.
    await query(
      `update user_profiles set is_active = false
       where id = $1 and business_id = $2 and not is_owner`,
      [userId, businessId]
    );
    revalidatePath("/admin/team");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("removeTeamMember failed", err);
    return { ok: false, error: "Could not remove this team member." };
  }
}
