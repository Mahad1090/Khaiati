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

export const dynamic = "force-dynamic";

async function DebtsTable({ q }: { q: string }) {
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
          No outstanding supplier debts.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Purchase #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Fabric</TableHead>
            <TableHead>Bill #</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Outstanding</TableHead>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Supplier Debts</h1>
        <p className="text-sm text-muted-foreground">
          Fabric purchases on credit with an outstanding balance — pay them down in installments.
        </p>
      </div>

      <Suspense>
        <SearchBox placeholder="Search by supplier or bill #..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <DebtsTable q={q} />
      </Suspense>
    </div>
  );
}
