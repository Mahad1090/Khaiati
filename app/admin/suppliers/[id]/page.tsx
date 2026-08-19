import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { SupplierFormDialog } from "@/components/admin/suppliers/supplier-form-dialog";
import {
  getSupplierById,
  getSupplierFinancialSummary,
  getSupplierPurchases,
} from "@/lib/actions/suppliers";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let supplier, summary, purchases;
  try {
    supplier = await getSupplierById(id);
    if (supplier) {
      [summary, purchases] = await Promise.all([
        getSupplierFinancialSummary(id),
        getSupplierPurchases(id),
      ]);
    }
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }
  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/suppliers">
          <ArrowLeft className="h-4 w-4" />
          Back to suppliers
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl">{supplier.company_name}</h1>
            <Badge variant="outline">{supplier.supplier_no}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {supplier.contact_person ?? "—"} · {supplier.phone ?? "—"}
          </p>
          {supplier.address && <p className="mt-1 text-sm text-muted-foreground">{supplier.address}</p>}
        </div>
        <SupplierFormDialog
          mode="edit"
          supplierId={supplier.id}
          defaultValues={{
            company_name: supplier.company_name,
            contact_person: supplier.contact_person ?? "",
            phone: supplier.phone ?? "",
            address: supplier.address ?? "",
            company_number: supplier.company_number ?? "",
            note: supplier.note ?? "",
          }}
          trigger={<Button variant="outline">Edit</Button>}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchased</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.totalPurchased)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.totalPaid)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.outstanding)}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">Purchases</h2>
        {purchases!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No purchases yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purchase #</TableHead>
                  <TableHead>Fabric</TableHead>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases!.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.purchase_no}</TableCell>
                    <TableCell>{p.fabric_name}</TableCell>
                    <TableCell>{p.company_bill_number ?? "—"}</TableCell>
                    <TableCell>{formatDate(p.purchase_date)}</TableCell>
                    <TableCell className="text-right">{formatMoney(p.total_price)}</TableCell>
                    <TableCell className="text-right">{formatMoney(p.amount_paid)}</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(Number(p.total_price) - Number(p.amount_paid))}
                    </TableCell>
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
