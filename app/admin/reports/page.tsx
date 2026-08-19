import Link from "next/link";
import { Users, ShoppingBag, HardHat, Scissors, Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { t } = await getServerLanguage();

  const reportLinks = [
    {
      href: "/admin/reports/customers",
      icon: Users,
      title: t.reports.customerReportsTitle,
      description: t.reports.customerReportsDesc,
    },
    {
      href: "/admin/reports/orders",
      icon: ShoppingBag,
      title: t.reports.orderReportsTitle,
      description: t.reports.orderReportsDesc,
    },
    {
      href: "/admin/reports/workers",
      icon: HardHat,
      title: t.reports.workerReportsTitle,
      description: t.reports.workerReportsDesc,
    },
    {
      href: "/admin/reports/fabrics",
      icon: Scissors,
      title: t.reports.fabricReportsTitle,
      description: t.reports.fabricReportsDesc,
    },
    {
      href: "/admin/profit-loss",
      icon: Wallet,
      title: t.reports.financialReportsTitle,
      description: t.reports.financialReportsDesc,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">{t.reports.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.reports.subtitle}
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
