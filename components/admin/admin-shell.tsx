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

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isBusinessStaff = access.kind === "business_staff";
  const isOwner = !isBusinessStaff || access.isOwner;
  const isPending = isBusinessStaff && access.businessStatus === "pending";
  const isBlocked = isBusinessStaff && (access.businessStatus === "rejected" || access.businessStatus === "suspended");

  return (
    <SidebarProvider>
      <AppSidebar hidePlatformGroup={isBusinessStaff} isOwner={isOwner} />
      <SidebarInset>
        {!authConfigured && (
          <div className="flex items-center gap-2 border-b border-accent/40 bg-accent/10 px-4 py-2 text-sm text-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />
            No sign-in is configured — this system is currently reachable by anyone with the URL. Set{" "}
            <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to require sign-in.
          </div>
        )}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm text-muted-foreground">
              {isBusinessStaff ? access.businessName : "Tailoring & Fabric Management"}
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
  return (
    <div className="mx-auto max-w-md py-16">
      <Card>
        <CardHeader className="items-center text-center">
          <Clock className="h-10 w-10 text-accent" />
          <CardTitle className="font-serif text-xl">Application Under Review</CardTitle>
          <CardDescription>
            Your business registration is still being reviewed by our team. You&apos;ll be able to manage your
            dashboard once it&apos;s approved.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function BlockedScreen({ status }: { status: string }) {
  const isRejected = status === "rejected";
  return (
    <div className="mx-auto max-w-md py-16">
      <Card>
        <CardHeader className="items-center text-center">
          {isRejected ? <XCircle className="h-10 w-10 text-destructive" /> : <Ban className="h-10 w-10 text-destructive" />}
          <CardTitle className="font-serif text-xl">
            {isRejected ? "Application Not Approved" : "Account Suspended"}
          </CardTitle>
          <CardDescription>
            {isRejected
              ? "Your business registration was not approved. Contact support if you believe this is a mistake."
              : "Your business account has been suspended. Contact support for details."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
