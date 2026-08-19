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
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function FabricDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getServerLanguage();

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
          {t.fabrics.backToFabrics}
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
          trigger={<Button variant="outline">{t.fabrics.edit}</Button>}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.fabrics.availableStock}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">
            {fabric.availableMeters} {fabric.unit}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.fabrics.priceMeter}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(fabric.price_per_meter)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.fabrics.sellingPrice}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(fabric.selling_price)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.fabrics.status}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={fabric.is_active ? "default" : "secondary"}>
              {fabric.is_active ? t.fabrics.active : t.fabrics.inactive}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">{t.fabrics.purchases}</h2>
          <PurchaseFormDialog fabricId={fabric.id} />
        </div>
        {purchases!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t.fabrics.noPurchasesYet}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.fabrics.purchaseNo}</TableHead>
                  <TableHead>{t.fabrics.supplierCol}</TableHead>
                  <TableHead>{t.fabrics.billNo}</TableHead>
                  <TableHead>{t.fabrics.meters}</TableHead>
                  <TableHead>{t.fabrics.payment}</TableHead>
                  <TableHead className="text-right">{t.fabrics.total}</TableHead>
                  <TableHead className="text-right">{t.fabrics.outstanding}</TableHead>
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
          <h2 className="font-serif text-lg">{t.fabrics.sales}</h2>
          <SaleFormDialog fabricId={fabric.id} availableMeters={fabric.availableMeters} />
        </div>
        {sales!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t.fabrics.noSalesYet}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.fabrics.saleNo}</TableHead>
                  <TableHead>{t.fabrics.customer}</TableHead>
                  <TableHead>{t.fabrics.meters}</TableHead>
                  <TableHead>{t.fabrics.date}</TableHead>
                  <TableHead className="text-right">{t.fabrics.total}</TableHead>
                  <TableHead className="text-right">{t.fabrics.balance}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales!.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.sale_no}</TableCell>
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
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">{t.fabrics.stockMovementHistory}</h2>
        {stockHistory!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t.fabrics.noMovementsYet}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.fabrics.date}</TableHead>
                  <TableHead>{t.fabrics.type}</TableHead>
                  <TableHead>{t.fabrics.note}</TableHead>
                  <TableHead className="text-right">{t.fabrics.change}</TableHead>
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
