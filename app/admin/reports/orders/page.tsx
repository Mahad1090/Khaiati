import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getOrderReport } from "@/lib/actions/reports";
import { orderStatusLabels, type OrderStatus } from "@/lib/validation/order";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderReportsPage() {
  let orders;
  try {
    orders = await getOrderReport();
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/reports">
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
      </Button>
      <h1 className="font-serif text-2xl">Order Reports</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">All Orders</p>
            <p className="font-serif text-2xl">{orders.all.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="font-serif text-2xl">{orders.completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Incomplete</p>
            <p className="font-serif text-2xl">{orders.incomplete.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="font-serif text-2xl text-destructive">{orders.overdue.length}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-2 font-serif text-lg">Overdue Orders</h2>
        {orders.overdue.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No overdue orders.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.overdue.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-accent">
                        {o.order_no}
                      </Link>
                    </TableCell>
                    <TableCell>{o.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{orderStatusLabels[o.status as OrderStatus] ?? o.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(o.due_date)}</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(Number(o.total_price) - Number(o.paid_amount))}
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
