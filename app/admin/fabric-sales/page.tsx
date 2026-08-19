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

export const dynamic = "force-dynamic";

async function SalesTable({ q }: { q: string }) {
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
          No sales found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale #</TableHead>
            <TableHead>Fabric</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Meters</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Balance</TableHead>
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
              <TableCell>{s.customer_name ?? "Walk-in"}</TableCell>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Fabric Sales</h1>
          <p className="text-sm text-muted-foreground">Every sale, across all fabrics.</p>
        </div>
        <GlobalSaleFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder="Search by fabric or customer..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <SalesTable q={q} />
      </Suspense>
    </div>
  );
}
