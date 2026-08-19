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
import { AddPurchasePaymentDialog } from "@/components/admin/fabrics/add-purchase-payment-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getOutstandingDebts } from "@/lib/actions/fabric-transactions";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

async function DebtsTable({ q }: { q: string }) {
  const { t } = await getServerLanguage();
  let rows;
  try {
    rows = await getOutstandingDebts(q);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t.fabrics.noneDebtsFound}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.fabrics.purchaseNo}</TableHead>
            <TableHead>{t.fabrics.supplierCol}</TableHead>
            <TableHead>{t.suppliers.fabric}</TableHead>
            <TableHead>{t.fabrics.billNo}</TableHead>
            <TableHead>{t.fabrics.purchaseDateCol}</TableHead>
            <TableHead className="text-right">{t.fabrics.total}</TableHead>
            <TableHead className="text-right">{t.suppliers.paid}</TableHead>
            <TableHead className="text-right">{t.fabrics.outstanding}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => {
            const outstanding = Number(d.total_price) - Number(d.amount_paid);
            return (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.purchase_no}</TableCell>
                <TableCell>
                  <Link href={`/admin/suppliers/${d.supplier_id}`} className="hover:text-accent">
                    {d.supplier_name}
                  </Link>
                </TableCell>
                <TableCell>{d.fabric_name}</TableCell>
                <TableCell>{d.company_bill_number ?? "—"}</TableCell>
                <TableCell>{formatDate(d.purchase_date)}</TableCell>
                <TableCell className="text-right">{formatMoney(d.total_price)}</TableCell>
                <TableCell className="text-right">{formatMoney(d.amount_paid)}</TableCell>
                <TableCell className="text-right font-medium">{formatMoney(outstanding)}</TableCell>
                <TableCell>
                  <AddPurchasePaymentDialog purchaseId={d.id} outstanding={outstanding} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function SupplierDebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { t } = await getServerLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">{t.fabrics.debtsTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {t.fabrics.debtsSubtitle}
        </p>
      </div>

      <Suspense>
        <SearchBox placeholder={t.fabrics.searchBySupplierOrBill} />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">{t.fabrics.loading}</p>}>
        <DebtsTable q={q} />
      </Suspense>
    </div>
  );
}
