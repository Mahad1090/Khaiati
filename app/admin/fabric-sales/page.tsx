import Link from "next/link";
import { Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBox } from "@/components/admin/search-box";
import { GlobalSaleFormDialog } from "@/components/admin/fabrics/global-sale-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getAllSales } from "@/lib/actions/fabric-transactions";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

async function SalesTable({ q }: { q: string }) {
  const { t } = await getServerLanguage();
  let rows;
  try {
    rows = await getAllSales(q);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t.fabrics.noSalesFound}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.fabrics.saleNo}</TableHead>
            <TableHead>{t.suppliers.fabric}</TableHead>
            <TableHead>{t.fabrics.customer}</TableHead>
            <TableHead>{t.fabrics.meters}</TableHead>
            <TableHead>{t.fabrics.date}</TableHead>
            <TableHead className="text-right">{t.fabrics.total}</TableHead>
            <TableHead className="text-right">{t.fabrics.balance}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.sale_no}</TableCell>
              <TableCell>
                <Link href={`/admin/fabrics/${s.fabric_id}`} className="hover:text-accent">
                  {s.fabric_name}
                </Link>
              </TableCell>
              <TableCell>{s.customer_name ?? t.fabrics.walkIn}</TableCell>
              <TableCell>{s.size_meters}</TableCell>
              <TableCell>{formatDate(s.sale_date)}</TableCell>
              <TableCell className="text-right">{formatMoney(s.total_price)}</TableCell>
              <TableCell className="text-right">
                {formatMoney(Number(s.total_price) - Number(s.amount_paid))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function FabricSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { t } = await getServerLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.fabrics.allSalesTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.fabrics.allSalesSubtitle}</p>
        </div>
        <GlobalSaleFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder={t.fabrics.searchByFabricOrCustomer} />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">{t.fabrics.loading}</p>}>
        <SalesTable q={q} />
      </Suspense>
    </div>
  );
}
