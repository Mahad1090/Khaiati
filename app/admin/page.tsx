import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  CalendarClock,
  Wallet,
  Building2,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getDashboardStats, getPlatformStats } from "@/lib/actions/dashboard";
import { getCurrentAccessContext } from "@/lib/auth/business-context";
import { formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-serif">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const access = await getCurrentAccessContext();
  const { t } = await getServerLanguage();
  const isPlatformAdmin = access.kind !== "business_staff";

  if (isPlatformAdmin) {
    let stats;
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
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl">{t.adminDashboard.platformTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.adminDashboard.platformSubtitle}</p>
          </div>
          <Button asChild>
            <Link href="/admin/businesses">{t.adminDashboard.manageBusinesses}</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t.adminDashboard.totalBusinesses} value={String(stats.totalBusinesses)} icon={Building2} />
          <StatCard label={t.adminDashboard.pendingApproval} value={String(stats.pendingBusinesses)} icon={Clock} />
          <StatCard label={t.adminDashboard.approvedBusinesses} value={String(stats.approvedBusinesses)} icon={CheckCircle2} />
          <StatCard label={t.adminDashboard.totalCustomers} value={String(stats.totalCustomers)} icon={Users} />
          <StatCard label={t.adminDashboard.totalOrders} value={String(stats.totalOrders)} icon={ShoppingBag} />
          <StatCard label={t.adminDashboard.platformRevenue} value={formatMoney(stats.platformRevenue)} icon={Wallet} />
          <StatCard label={t.adminDashboard.activeSubscriptions} value={String(stats.activeSubscriptions)} icon={CreditCard} />
          <StatCard
            label={t.adminDashboard.pendingSubscriptionPayments}
            value={String(stats.pendingSubscriptionPayments)}
            icon={CalendarClock}
          />
        </div>
      </div>
    );
  }

  let stats;
  try {
    stats = await getDashboardStats();
  } catch (err) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl">{t.adminDashboard.title}</h1>
          <p className="text-sm text-muted-foreground">{t.adminDashboard.subtitle}</p>
        </div>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.adminDashboard.title}</h1>
          <p className="text-sm text-muted-foreground">{t.adminDashboard.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/customers">{t.adminDashboard.customers}</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/orders">{t.adminDashboard.orders}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.adminDashboard.totalCustomers} value={String(stats.totalCustomers)} icon={Users} />
        <StatCard label={t.adminDashboard.activeOrders} value={String(stats.activeOrders)} icon={ShoppingBag} />
        <StatCard label={t.adminDashboard.pendingOrders} value={String(stats.pendingOrders)} icon={Clock} />
        <StatCard label={t.adminDashboard.completedOrders} value={String(stats.completedOrders)} icon={CheckCircle2} />
        <StatCard label={t.adminDashboard.dueWithin7Days} value={String(stats.ordersDueSoon)} icon={CalendarClock} />
        <StatCard label={t.adminDashboard.totalBilled} value={formatMoney(stats.totalBilled)} icon={Wallet} />
        <StatCard label={t.adminDashboard.totalCollected} value={formatMoney(stats.totalCollected)} icon={Wallet} />
        <StatCard
          label={t.adminDashboard.outstandingBalance}
          value={formatMoney(stats.outstandingBalance)}
          icon={Wallet}
        />
      </div>
    </div>
  );
}
