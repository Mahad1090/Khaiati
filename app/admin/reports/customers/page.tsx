import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getCustomerReport } from "@/lib/actions/reports";
import { formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function CustomerReportsPage() {
  const { t } = await getServerLanguage();
  let customers;
  try {
    customers = await getCustomerReport();
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/reports">
          <ArrowLeft className="h-4 w-4" />
          {t.reports.backToReports}
        </Link>
      </Button>
      <h1 className="font-serif text-2xl">{t.reports.customerReportsTitle}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t.reports.allCustomers}</p>
            <p className="font-serif text-2xl">{customers.all.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t.reports.newThisMonth}</p>
            <p className="font-serif text-2xl">{customers.newThisMonth.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t.reports.withOutstandingBalance}</p>
            <p className="font-serif text-2xl">{customers.withBalance.length}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-2 font-serif text-lg">{t.reports.outstandingBalances}</h2>
        {customers.withBalance.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t.reports.noneWithBalance}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.reports.customerNo}</TableHead>
                  <TableHead>{t.reports.name}</TableHead>
                  <TableHead>{t.reports.orders}</TableHead>
                  <TableHead className="text-right">{t.reports.paid}</TableHead>
                  <TableHead className="text-right">{t.reports.balance}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.withBalance.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Badge variant="outline">{c.customer_no}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-accent">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>{c.total_orders}</TableCell>
                    <TableCell className="text-right">{formatMoney(c.total_paid)}</TableCell>
                    <TableCell className="text-right">{formatMoney(c.outstanding_balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
