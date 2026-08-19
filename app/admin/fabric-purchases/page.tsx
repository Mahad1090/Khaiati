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
import { GlobalPurchaseFormDialog } from "@/components/admin/fabrics/global-purchase-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getAllPurchases } from "@/lib/actions/fabric-transactions";
import { paymentTypeLabels, type PaymentType } from "@/lib/validation/fabric";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

async function PurchasesTable({ q }: { q: string }) {
  const { t } = await getServerLanguage();
  let rows;
  try {
    rows = await getAllPurchases(q);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t.fabrics.noPurchasesFound}
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
            <TableHead>{t.suppliers.fabric}</TableHead>
            <TableHead>{t.fabrics.supplierCol}</TableHead>
            <TableHead>{t.fabrics.billNo}</TableHead>
            <TableHead>{t.fabrics.meters}</TableHead>
            <TableHead>{t.fabrics.date}</TableHead>
            <TableHead>{t.fabrics.payment}</TableHead>
            <TableHead className="text-right">{t.fabrics.total}</TableHead>
            <TableHead className="text-right">{t.fabrics.outstanding}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.purchase_no}</TableCell>
              <TableCell>
                <Link href={`/admin/fabrics/${p.fabric_id}`} className="hover:text-accent">
                  {p.fabric_name}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/suppliers/${p.supplier_id}`} className="hover:text-accent">
                  {p.supplier_name}
                </Link>
              </TableCell>
              <TableCell>{p.company_bill_number ?? "—"}</TableCell>
              <TableCell>{p.size_meters}</TableCell>
              <TableCell>{formatDate(p.purchase_date)}</TableCell>
              <TableCell>{paymentTypeLabels[p.payment_type as PaymentType] ?? p.payment_type}</TableCell>
              <TableCell className="text-right">{formatMoney(p.total_price)}</TableCell>
              <TableCell className="text-right">
                {formatMoney(Number(p.total_price) - Number(p.amount_paid))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function FabricPurchasesPage({
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
          <h1 className="font-serif text-2xl">{t.fabrics.allPurchasesTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.fabrics.allPurchasesSubtitle}</p>
        </div>
        <GlobalPurchaseFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder={t.fabrics.searchByFabricSupplierBill} />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">{t.fabrics.loading}</p>}>
        <PurchasesTable q={q} />
      </Suspense>
    </div>
  );
}
