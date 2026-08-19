import { query } from "@/lib/db";
import type { Role } from "@/lib/permissions";

export type UserProfileRow = {
  id: string;
  full_name: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
};

/** Reads real rows from user_profiles (populated once Supabase Auth creates accounts). */
export async function listUserProfiles(): Promise<UserProfileRow[]> {
  const { rows } = await query<UserProfileRow>(
    `select id, full_name, role, is_active, created_at
     from user_profiles
     order by created_at desc`
  );
  return rows;
}
