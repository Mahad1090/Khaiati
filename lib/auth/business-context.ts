import "server-only";
import { query } from "@/lib/db";
import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@/lib/supabase/server";

const DEFAULT_BUSINESS_SLUG = "khaiati-default";

let cachedDefaultBusinessId: string | null = null;

async function getDefaultBusinessId(): Promise<string> {
  if (cachedDefaultBusinessId) return cachedDefaultBusinessId;
  const { rows } = await query<{ id: string }>(
    `select id from businesses where slug = $1`,
    [DEFAULT_BUSINESS_SLUG]
  );
  if (!rows[0]) {
    throw new Error(
      "No default business found. Run db/migrations/0010_tenant_backfill.sql against your database."
    );
  }
  cachedDefaultBusinessId = rows[0].id;
  return cachedDefaultBusinessId;
}

/**
 * Resolves which business the current request should be scoped to.
 *
 * - If Supabase Auth is configured and the signed-in user's profile has a
 *   business_id, that business is used — real tenant isolation.
 * - Otherwise (auth not configured yet, or the user isn't assigned to a
 *   business), falls back to the single default "Khaiati" business. This
 *   keeps the system behaving exactly as it did before multi-tenancy existed
 *   until real business-staff accounts are wired up — no silent breakage.
 */
export async function getCurrentBusinessId(): Promise<string> {
  if (isSupabaseAuthConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { rows } = await query<{ business_id: string | null }>(
          `select business_id from user_profiles where id = $1`,
          [user.id]
        );
        if (rows[0]?.business_id) return rows[0].business_id;
      }
    } catch {
      // Fall through to the default business below.
    }
  }
  return getDefaultBusinessId();
}

export type AccessContext =
  | { kind: "platform_admin" }
  | { kind: "business_staff"; businessId: string; businessName: string; businessStatus: string; isOwner: boolean }
  | { kind: "no_business" }; // signed in, but no business assigned yet

/**
 * Determines what nav/pages the current signed-in user should see:
 * - No business_id on their profile → platform admin (sees Businesses approval, etc).
 * - business_id set → business staff, scoped to that business only; blocked
 *   with a "pending approval" screen unless the business is approved.
 * Only meaningful once Supabase Auth is configured — callers should treat an
 * unconfigured/unauthenticated request as platform_admin (today's default
 * behavior, unchanged) rather than calling this at all.
 */
export async function getCurrentAccessContext(): Promise<AccessContext> {
  if (!isSupabaseAuthConfigured()) {
    return { kind: "platform_admin" };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { kind: "platform_admin" };

    const { rows } = await query<{ business_id: string | null; is_owner: boolean }>(
      `select business_id, is_owner from user_profiles where id = $1`,
      [user.id]
    );
    const businessId = rows[0]?.business_id;
    if (!businessId) return { kind: "platform_admin" };

    const { rows: bizRows } = await query<{ name: string; status: string }>(
      `select name, status from businesses where id = $1`,
      [businessId]
    );
    if (!bizRows[0]) return { kind: "no_business" };

    return {
      kind: "business_staff",
      businessId,
      businessName: bizRows[0].name,
      businessStatus: bizRows[0].status,
      isOwner: rows[0]?.is_owner ?? false,
    };
  } catch {
    return { kind: "platform_admin" };
  }
}

/**
 * Throws unless the current user is the business owner (or a platform
 * admin, or auth isn't configured yet — matching the honest-fallback
 * pattern used throughout). Call from mutating actions that should be
 * owner-only per doc §36 (revenue, subscriptions, inviting employees).
 */
export async function requireOwner(): Promise<void> {
  const access = await getCurrentAccessContext();
  if (access.kind === "business_staff" && !access.isOwner) {
    throw new Error("OWNER_ONLY");
  }
}
