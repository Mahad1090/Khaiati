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
import { FabricFormDialog } from "@/components/admin/fabrics/fabric-form-dialog";
import { PurchaseFormDialog } from "@/components/admin/fabrics/purchase-form-dialog";
import { SaleFormDialog } from "@/components/admin/fabrics/sale-form-dialog";
import { AddPurchasePaymentDialog } from "@/components/admin/fabrics/add-purchase-payment-dialog";
import { getFabricById, getFabricStockHistory } from "@/lib/actions/fabrics";
import { getFabricPurchases, getFabricSales } from "@/lib/actions/fabric-transactions";
import { paymentTypeLabels, type PaymentType } from "@/lib/validation/fabric";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FabricDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let fabric, purchases, sales, stockHistory;
  try {
    fabric = await getFabricById(id);
    if (fabric) {
      [purchases, sales, stockHistory] = await Promise.all([
        getFabricPurchases(id),
        getFabricSales(id),
        getFabricStockHistory(id),
      ]);
    }
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }
  if (!fabric) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/fabrics">
          <ArrowLeft className="h-4 w-4" />
          Back to fabrics
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl">{fabric.name}</h1>
            <Badge variant="outline">{fabric.fabric_no}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {fabric.fabric_type ?? "—"} · {fabric.color ?? "—"} · {fabric.supplier_name ?? "No supplier"}
          </p>
        </div>
        <FabricFormDialog
          mode="edit"
          fabricId={fabric.id}
          defaultValues={{
            name: fabric.name,
            fabric_type: fabric.fabric_type ?? "",
            supplier_id: fabric.supplier_id ?? "",
            color: fabric.color ?? "",
            price_per_meter: Number(fabric.price_per_meter),
            selling_price: Number(fabric.selling_price),
            unit: fabric.unit,
            note: fabric.note ?? "",
            is_active: fabric.is_active,
          }}
          trigger={<Button variant="outline">Edit</Button>}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Stock</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">
            {fabric.availableMeters} {fabric.unit}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price / Meter</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(fabric.price_per_meter)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selling Price</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(fabric.selling_price)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={fabric.is_active ? "default" : "secondary"}>
              {fabric.is_active ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">Purchases</h2>
          <PurchaseFormDialog fabricId={fabric.id} />
        </div>
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
                  <TableHead>Supplier</TableHead>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Meters</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases!.map((p) => {
                  const outstanding = Number(p.total_price) - Number(p.amount_paid);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.purchase_no}</TableCell>
                      <TableCell>{p.supplier_name}</TableCell>
                      <TableCell>{p.company_bill_number ?? "—"}</TableCell>
                      <TableCell>{p.size_meters}</TableCell>
                      <TableCell>{paymentTypeLabels[p.payment_type as PaymentType] ?? p.payment_type}</TableCell>
                      <TableCell className="text-right">{formatMoney(p.total_price)}</TableCell>
                      <TableCell className="text-right">{formatMoney(outstanding)}</TableCell>
                      <TableCell>
                        <AddPurchasePaymentDialog purchaseId={p.id} outstanding={outstanding} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">Sales</h2>
          <SaleFormDialog fabricId={fabric.id} availableMeters={fabric.availableMeters} />
        </div>
        {sales!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No sales yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Meters</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales!.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.sale_no}</TableCell>
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
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">Stock Movement History</h2>
        {stockHistory!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No stock movements yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockHistory!.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDate(m.created_at)}</TableCell>
                    <TableCell className="capitalize">{m.movement_type}</TableCell>
                    <TableCell>{m.note ?? "—"}</TableCell>
                    <TableCell className={`text-right ${Number(m.quantity_meters) < 0 ? "text-destructive" : ""}`}>
                      {Number(m.quantity_meters) > 0 ? "+" : ""}
                      {m.quantity_meters}
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
