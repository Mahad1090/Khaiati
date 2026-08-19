import Link from "next/link";
import { AlertTriangle } from "lucide-react";
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
import { listFabrics } from "@/lib/actions/fabrics";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 10; // meters

export default async function InventoryPage() {
  let fabrics;
  try {
    fabrics = await listFabrics();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Inventory</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  const totalMeters = fabrics.reduce((s, f) => s + f.availableMeters, 0);
  const lowStock = fabrics.filter((f) => f.availableMeters <= LOW_STOCK_THRESHOLD && f.availableMeters > 0);
  const outOfStock = fabrics.filter((f) => f.availableMeters <= 0);
  const totalValue = fabrics.reduce((s, f) => s + f.availableMeters * Number(f.price_per_meter), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Live stock across all fabrics, derived from purchase and sale movements.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fabrics Tracked</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{fabrics.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Meters in Stock</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{totalMeters.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Value (at cost)</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(totalValue)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low / Out of Stock</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 font-serif text-xl">
            {lowStock.length + outOfStock.length}
            {lowStock.length + outOfStock.length > 0 && <AlertTriangle className="h-4 w-4 text-accent" />}
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fabric #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Cost/Meter</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fabrics.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <Badge variant="outline">{f.fabric_no}</Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/fabrics/${f.id}`} className="font-medium hover:text-accent">
                    {f.name}
                  </Link>
                </TableCell>
                <TableCell>{f.color ?? "—"}</TableCell>
                <TableCell>{f.supplier_name ?? "—"}</TableCell>
                <TableCell className="text-right">{formatMoney(f.price_per_meter)}</TableCell>
                <TableCell className="text-right">{formatMoney(f.selling_price)}</TableCell>
                <TableCell className="text-right">
                  {f.availableMeters} {f.unit}
                </TableCell>
                <TableCell>
                  {f.availableMeters <= 0 ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                  ) : f.availableMeters <= LOW_STOCK_THRESHOLD ? (
                    <Badge variant="secondary">Low Stock</Badge>
                  ) : (
                    <Badge variant="default">In Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
