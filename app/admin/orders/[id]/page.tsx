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
import { OrderStatusSelect } from "@/components/admin/orders/order-status-select";
import { OrderTrackingCard } from "@/components/admin/orders/order-tracking-card";
import { AddPaymentDialog } from "@/components/admin/orders/add-payment-dialog";
import { getOrderDetail } from "@/lib/actions/orders";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { measurementFieldLabels, garmentMeasurementFields } from "@/lib/validation/measurements";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getServerLanguage();

  let order;
  try {
    order = await getOrderDetail(id);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/orders">
          <ArrowLeft className="h-4 w-4" />
          {t.orders.backToOrders}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl">{order.order_no}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/admin/customers/${order.customer.id}`} className="hover:text-accent">
              {order.customer.name}
            </Link>{" "}
            · {order.customer.phone} · {order.customer.customer_no}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.orders.orderDate}</CardTitle>
          </CardHeader>
          <CardContent>{formatDate(order.order_date)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.orders.dueDate}</CardTitle>
          </CardHeader>
          <CardContent>{formatDate(order.due_date)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.orders.totalPrice}</CardTitle>
          </CardHeader>
          <CardContent>{formatMoney(order.totalPrice)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.orders.balance}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span>{formatMoney(order.balance)}</span>
          </CardContent>
        </Card>
      </div>

      <OrderTrackingCard trackingToken={order.tracking_token} />

      {order.note && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t.orders.orderNote}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{order.note}</CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="font-serif text-lg">{t.orders.garments}</h2>
        {order.items.map((item) => {
          const gt = item.garment_type as GarmentType;
          const fields = garmentMeasurementFields[gt] ?? [];
          return (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {garmentTypeLabels[gt] ?? item.garment_type}
                  {item.design_name && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      · {item.design_name}
                    </span>
                  )}
                </CardTitle>
                <Badge variant="outline">{t.orders.qty} {item.quantity}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span>{t.orders.pricePerPiece} {formatMoney(item.price_per_piece)}</span>
                  <span>{t.orders.total}: {formatMoney(item.total_price)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {fields.map((f) => (
                    <div key={f} className="rounded-md border border-border px-3 py-2">
                      <p className="text-xs text-muted-foreground">{measurementFieldLabels[f]}</p>
                      <p className="text-sm">{item.measurements[f] ?? "—"}</p>
                    </div>
                  ))}
                </div>
                {item.note && <p className="text-sm text-muted-foreground">{t.orders.note} {item.note}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">{t.orders.payments}</h2>
          <AddPaymentDialog orderId={order.id} balance={order.balance} />
        </div>
        {order.payments.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t.orders.noPaymentsYet}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.orders.date}</TableHead>
                  <TableHead>{t.adminCommon.note}</TableHead>
                  <TableHead className="text-right">{t.orders.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.paid_at)}</TableCell>
                    <TableCell>{p.note ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatMoney(p.amount)}</TableCell>
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
