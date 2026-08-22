import Link from "next/link";
import {
  Building2,
  Clock,
  CheckCircle2,
  Users,
  ShoppingBag,
  Wallet,
  CreditCard,
  Scissors,
  Timer,
  Palette,
  ArrowRight,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getCurrentAccessContext } from "@/lib/auth/business-context";
import { getPlatformStats, getDashboardStats, type PlatformStats, type DashboardStats } from "@/lib/actions/dashboard";
import { listMyServices } from "@/lib/actions/services";
import { listDesigns } from "@/lib/actions/designs";
import { getMyBusinessProfile } from "@/lib/actions/businesses";
import { formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

type T = Awaited<ReturnType<typeof getServerLanguage>>["t"];

export default async function AdminDashboardPage() {
  const { t } = await getServerLanguage();
  const access = await getCurrentAccessContext();

  // Platform admin (no business assigned, or auth not configured yet) —
  // sees marketplace-wide numbers and a shortcut to the approval queue.
  if (access.kind === "platform_admin") {
    let stats: PlatformStats;
    try {
      stats = await getPlatformStats();
    } catch (err) {
      return (
        <div className="space-y-6">
          <h1 className="font-serif text-2xl">{t.adminDashboard.platformTitle}</h1>
          <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
        </div>
      );
    }
    return <PlatformDashboard stats={stats} t={t} />;
  }

  if (access.kind === "no_business") {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.adminDashboard.title}</h1>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t.platformAdmin.noBusinessFound}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Business owner / staff — AdminShell already intercepts pending or
  // blocked (rejected/suspended) businesses with their own screens, so
  // reaching here means this business is approved and live.
  let stats: DashboardStats;
  let services: Awaited<ReturnType<typeof listMyServices>>;
  let designs: Awaited<ReturnType<typeof listDesigns>>;
  let profile: Awaited<ReturnType<typeof getMyBusinessProfile>>;
  try {
    [stats, services, designs, profile] = await Promise.all([
      getDashboardStats(),
      listMyServices(),
      listDesigns(),
      getMyBusinessProfile(),
    ]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.adminDashboard.title}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <BusinessDashboard
      stats={stats}
      publishedServices={services.filter((s) => s.is_available).length}
      totalServices={services.length}
      activeDesigns={designs.filter((d) => d.is_active).length}
      businessName={profile?.name ?? access.businessName}
      t={t}
    />
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-serif text-2xl">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-accent" />
      </CardContent>
    </Card>
  );
}

function PlatformDashboard({ stats, t }: { stats: PlatformStats; t: T }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.adminDashboard.platformTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.adminDashboard.platformSubtitle}</p>
        </div>
        <Button asChild>
          <Link href="/admin/businesses">{t.adminDashboard.manageBusinesses}</Link>
        </Button>
      </div>

      {stats.pendingBusinesses > 0 && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-accent" />
              <p className="text-sm">
                <span className="font-medium">{stats.pendingBusinesses}</span>{" "}
                {stats.pendingBusinesses === 1 ? "business is" : "businesses are"} waiting for approval — they and their
                garment types won't show up for customers until reviewed.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/businesses?status=pending">
                Review now <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.adminDashboard.totalBusinesses} value={stats.totalBusinesses} icon={Building2} />
        <StatCard label={t.adminDashboard.pendingApproval} value={stats.pendingBusinesses} icon={Clock} />
        <StatCard label={t.adminDashboard.approvedBusinesses} value={stats.approvedBusinesses} icon={CheckCircle2} />
        <StatCard label={t.adminDashboard.totalCustomers} value={stats.totalCustomers} icon={Users} />
        <StatCard label={t.adminDashboard.totalOrders} value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard label={t.adminDashboard.platformRevenue} value={formatMoney(stats.platformRevenue)} icon={Wallet} />
        <StatCard label={t.adminDashboard.activeSubscriptions} value={stats.activeSubscriptions} icon={CreditCard} />
        <StatCard
          label={t.adminDashboard.pendingSubscriptionPayments}
          value={stats.pendingSubscriptionPayments}
          icon={Clock}
        />
      </div>
    </div>
  );
}

function BusinessDashboard({
  stats,
  publishedServices,
  totalServices,
  activeDesigns,
  businessName,
  t,
}: {
  stats: DashboardStats;
  publishedServices: number;
  totalServices: number;
  activeDesigns: number;
  businessName: string;
  t: T;
}) {
  const needsServices = publishedServices === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">{t.adminDashboard.title}</h1>
        <p className="text-sm text-muted-foreground">
          {businessName} — {t.adminDashboard.subtitle}
        </p>
      </div>

      {/* Bridges the admin → customer gap: an approved business with no
          available service is invisible on the public tailoring flow, and
          that disconnect is exactly what reads as "no approved tailors"
          to customers. Surface it here instead of letting it be a silent
          mismatch discovered only from the customer side. */}
      {needsServices && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
            <div className="flex items-center gap-3">
              <Scissors className="h-5 w-5 text-accent" />
              <p className="text-sm">
                You haven't published any available stitching services yet — customers won't see {businessName} in the
                tailoring flow until you add at least one.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/services">
                Add a service <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.adminDashboard.customers} value={stats.totalCustomers} icon={Users} />
        <StatCard label={t.adminDashboard.activeOrders} value={stats.activeOrders} icon={ShoppingBag} />
        <StatCard label={t.adminDashboard.pendingOrders} value={stats.pendingOrders} icon={Clock} />
        <StatCard label={t.adminDashboard.completedOrders} value={stats.completedOrders} icon={CheckCircle2} />
        <StatCard label={t.adminDashboard.dueWithin7Days} value={stats.ordersDueSoon} icon={Timer} />
        <StatCard label={t.adminDashboard.totalBilled} value={formatMoney(stats.totalBilled)} icon={Wallet} />
        <StatCard label={t.adminDashboard.totalCollected} value={formatMoney(stats.totalCollected)} icon={CreditCard} />
        <StatCard label={t.adminDashboard.outstandingBalance} value={formatMoney(stats.outstandingBalance)} icon={Wallet} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storefront readiness</CardTitle>
          <CardDescription>What customers can currently see and select in the tailoring flow.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ReadinessRow
            icon={Scissors}
            label="Published services"
            value={`${publishedServices} of ${totalServices} available`}
            ok={publishedServices > 0}
            href="/admin/services"
            cta="Manage services"
          />
          <ReadinessRow
            icon={Palette}
            label="Active designs"
            value={`${activeDesigns} active`}
            ok={activeDesigns > 0}
            href="/admin/designs"
            cta="Manage designs"
            optional
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ReadinessRow({
  icon: Icon,
  label,
  value,
  ok,
  href,
  cta,
  optional,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  ok: boolean;
  href: string;
  cta: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {label} {optional && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={ok ? "outline" : "secondary"}>{ok ? "Ready" : "Needs attention"}</Badge>
        <Button asChild size="sm" variant="ghost">
          <Link href={href}>{cta}</Link>
        </Button>
      </div>
    </div>
  );
}