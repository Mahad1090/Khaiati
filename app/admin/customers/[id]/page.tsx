import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CustomerFormDialog } from "@/components/admin/customers/customer-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import {
  getCustomerDetail,
  getCustomerOrderHistory,
} from "@/lib/actions/customers";
import { orderStatusLabels, type OrderStatus } from "@/lib/validation/order";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let customer;
  let history;
  try {
    customer = await getCustomerDetail(id);
    history = customer ? await getCustomerOrderHistory(id) : [];
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/customers">
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl">{customer.name}</h1>
            <Badge variant="outline">{customer.customer_no}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
          {customer.note && (
            <p className="mt-1 text-sm text-muted-foreground">{customer.note}</p>
          )}
        </div>
        <div className="flex gap-2">
          <CustomerFormDialog
            mode="edit"
            customerId={customer.id}
            defaultValues={{ name: customer.name, phone: customer.phone, note: customer.note ?? "" }}
            trigger={<Button variant="outline">Edit</Button>}
          />
          <Button asChild>
            <Link href={`/admin/orders/new?customer=${customer.id}`}>New Order</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-2xl">{customer.totalOrders}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-2xl">
            {formatMoney(customer.totalPaid)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-2xl">
            {formatMoney(customer.outstandingBalance)}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-serif text-lg">Order History</h2>
        {history.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Garments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-accent">
                        {o.order_no}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {o.garment_types
                        .map((g) => garmentTypeLabels[g as GarmentType] ?? g)
                        .join(", ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {orderStatusLabels[o.status as OrderStatus] ?? o.status}
                      </Badge>
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
        )}
      </div>
    </div>
  );
}
