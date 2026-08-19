import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { isSupabaseAuthConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentAccessContext } from "@/lib/auth/business-context";

export const metadata: Metadata = {
  title: "Khaiati Management",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authConfigured = isSupabaseAuthConfigured();
  let userEmail: string | null = null;

  if (authConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userEmail = user?.email ?? null;
    } catch {
      // Supabase reachable check failed — the shell's banner logic still
      // reflects authConfigured, not an unverifiable "guest" state.
    }
  }

  const access = await getCurrentAccessContext();

  return (
    <AdminShell authConfigured={authConfigured} userEmail={userEmail} access={access}>
      {children}
    </AdminShell>
  );
}
