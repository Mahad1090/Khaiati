"use client";

import { usePathname } from "next/navigation";
import { AlertTriangle, Clock, Ban, XCircle } from "lucide-react";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { AccessContext } from "@/lib/auth/business-context";
import { useLanguage } from "@/lib/i18n/language-context";

export function AdminShell({
  children,
  authConfigured,
  userEmail,
  access,
}: {
  children: React.ReactNode;
  authConfigured: boolean;
  userEmail: string | null;
  access: AccessContext;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isBusinessStaff = access.kind === "business_staff";
  const isOwner = !isBusinessStaff || access.isOwner;
  const staffRole = isBusinessStaff ? access.role : undefined;
  const isPending = isBusinessStaff && access.businessStatus === "pending";
  const isBlocked = isBusinessStaff && (access.businessStatus === "rejected" || access.businessStatus === "suspended");

  return (
    <SidebarProvider>
      <AppSidebar hidePlatformGroup={isBusinessStaff} isOwner={isOwner} role={staffRole} />
      <SidebarInset>
        {!authConfigured && (
          <div className="flex items-center gap-2 border-b border-accent/40 bg-accent/10 px-4 py-2 text-sm text-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />
            {t.adminShell.noAuthWarning}{" "}
            <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> {t.adminShell.noAuthWarningAnd}{" "}
            <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> {t.adminShell.noAuthWarningEnd}
          </div>
        )}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm text-muted-foreground">
              {isBusinessStaff ? access.businessName : t.adminShell.defaultTitle}
            </span>
          </div>
          {authConfigured && (
            <div className="flex items-center gap-3">
              <NotificationBell />
              {userEmail && <span className="text-sm text-muted-foreground">{userEmail}</span>}
              <SignOutButton />
            </div>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6">
          {isPending ? (
            <PendingScreen />
          ) : isBlocked ? (
            <BlockedScreen status={(access as Extract<AccessContext, { kind: "business_staff" }>).businessStatus} />
          ) : (
            children
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function PendingScreen() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-md py-16">
      <Card>
        <CardHeader className="items-center text-center">
          <Clock className="h-10 w-10 text-accent" />
          <CardTitle className="font-serif text-xl">{t.adminShell.pendingTitle}</CardTitle>
          <CardDescription>
            {t.adminShell.pendingDesc}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function BlockedScreen({ status }: { status: string }) {
  const { t } = useLanguage();
  const isRejected = status === "rejected";
  return (
    <div className="mx-auto max-w-md py-16">
      <Card>
        <CardHeader className="items-center text-center">
          {isRejected ? <XCircle className="h-10 w-10 text-destructive" /> : <Ban className="h-10 w-10 text-destructive" />}
          <CardTitle className="font-serif text-xl">
            {isRejected ? t.adminShell.rejectedTitle : t.adminShell.suspendedTitle}
          </CardTitle>
          <CardDescription>
            {isRejected ? t.adminShell.rejectedDesc : t.adminShell.suspendedDesc}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
