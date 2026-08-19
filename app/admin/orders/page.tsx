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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/admin/search-box";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { searchOrders } from "@/lib/actions/orders";
import { orderStatusLabels, type OrderStatus } from "@/lib/validation/order";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusVariant: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new_order: "secondary",
  measurements_taken: "secondary",
  submitted_to_scissors: "outline",
  submitted_to_sewing: "outline",
  in_process: "outline",
  completed: "default",
  delivered: "default",
  canceled: "destructive",
};

async function OrdersTable({ q }: { q: string }) {
  let orders;
  try {
    orders = await searchOrders(q);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No orders found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell>
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-accent">
                  {o.order_no}
                </Link>
              </TableCell>
              <TableCell>
                {o.customer_name}
                <span className="block text-xs text-muted-foreground">{o.customer_phone}</span>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[o.status]}>{orderStatusLabels[o.status]}</Badge>
              </TableCell>
              <TableCell>{formatDate(o.order_date)}</TableCell>
              <TableCell>{formatDate(o.due_date)}</TableCell>
              <TableCell className="text-right">{formatMoney(o.total_price)}</TableCell>
              <TableCell className="text-right">
                {formatMoney(Number(o.total_price) - Number(o.paid_amount))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Search by order number, customer name, or phone.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/orders/new">New Order</Link>
        </Button>
      </div>

      <Suspense>
        <SearchBox placeholder="Search orders..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <OrdersTable q={q} />
      </Suspense>
    </div>
  );
}
