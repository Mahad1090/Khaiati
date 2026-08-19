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
  const isPlatformAdmin = access.kind !== "business_staff";

  if (isPlatformAdmin) {
    let stats;
    try {
      stats = await getPlatformStats();
    } catch (err) {
      return (
        <div className="space-y-6">
          <h1 className="font-serif text-2xl">Platform Dashboard</h1>
          <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl">Platform Dashboard</h1>
            <p className="text-sm text-muted-foreground">Across every business on Khaiati.</p>
          </div>
          <Button asChild>
            <Link href="/admin/businesses">Manage Businesses</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Businesses" value={String(stats.totalBusinesses)} icon={Building2} />
          <StatCard label="Pending Approval" value={String(stats.pendingBusinesses)} icon={Clock} />
          <StatCard label="Approved Businesses" value={String(stats.approvedBusinesses)} icon={CheckCircle2} />
          <StatCard label="Total Customers" value={String(stats.totalCustomers)} icon={Users} />
          <StatCard label="Total Orders" value={String(stats.totalOrders)} icon={ShoppingBag} />
          <StatCard label="Platform Revenue" value={formatMoney(stats.platformRevenue)} icon={Wallet} />
          <StatCard label="Active Subscriptions" value={String(stats.activeSubscriptions)} icon={CreditCard} />
          <StatCard
            label="Pending Subscription Payments"
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
          <h1 className="font-serif text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Business overview</p>
        </div>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Business overview</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/customers">Customers</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/orders">Orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value={String(stats.totalCustomers)} icon={Users} />
        <StatCard label="Active Orders" value={String(stats.activeOrders)} icon={ShoppingBag} />
        <StatCard label="Pending Orders" value={String(stats.pendingOrders)} icon={Clock} />
        <StatCard label="Completed Orders" value={String(stats.completedOrders)} icon={CheckCircle2} />
        <StatCard label="Due Within 7 Days" value={String(stats.ordersDueSoon)} icon={CalendarClock} />
        <StatCard label="Total Billed" value={formatMoney(stats.totalBilled)} icon={Wallet} />
        <StatCard label="Total Collected" value={formatMoney(stats.totalCollected)} icon={Wallet} />
        <StatCard
          label="Outstanding Balance"
          value={formatMoney(stats.outstandingBalance)}
          icon={Wallet}
        />
      </div>
    </div>
  );
}
