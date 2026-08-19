import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service-role Supabase client — bypasses RLS, server-only. Never import this into client code. */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
