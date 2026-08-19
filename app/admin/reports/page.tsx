import Link from "next/link";
import { Users, ShoppingBag, HardHat, Scissors, Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const reportLinks = [
  {
    href: "/admin/reports/customers",
    icon: Users,
    title: "Customer Reports",
    description: "All customers, new this month, and outstanding balances.",
  },
  {
    href: "/admin/reports/orders",
    icon: ShoppingBag,
    title: "Order Reports",
    description: "All, completed, incomplete, and overdue orders.",
  },
  {
    href: "/admin/reports/workers",
    icon: HardHat,
    title: "Worker Reports",
    description: "Assigned/completed work, wages, salary, and advances per worker.",
  },
  {
    href: "/admin/reports/fabrics",
    icon: Scissors,
    title: "Fabric Reports",
    description: "Purchased, sold, and remaining stock by fabric and supplier.",
  },
  {
    href: "/admin/profit-loss",
    icon: Wallet,
    title: "Financial Reports",
    description: "Income, expenses, and profit & loss for any date range.",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Cross-cutting views across customers, orders, workers, fabrics, and finance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportLinks.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="h-full transition-colors hover:border-accent">
              <CardHeader>
                <r.icon className="h-5 w-5 text-accent" />
                <CardTitle className="text-base">{r.title}</CardTitle>
                <CardDescription>{r.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
