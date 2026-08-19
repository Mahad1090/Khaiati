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
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 10; // meters

export default async function InventoryPage() {
  const { t } = await getServerLanguage();
  let fabrics;
  try {
    fabrics = await listFabrics();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.fabrics.inventoryTitle}</h1>
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
        <h1 className="font-serif text-2xl">{t.fabrics.inventoryTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {t.fabrics.inventorySubtitle}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.fabrics.fabricsTracked}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{fabrics.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.fabrics.totalMetersInStock}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{totalMeters.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.fabrics.stockValueAtCost}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(totalValue)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.fabrics.lowOutOfStock}</CardTitle>
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
              <TableHead>{t.fabrics.fabricNo}</TableHead>
              <TableHead>{t.fabrics.name}</TableHead>
              <TableHead>{t.fabrics.color}</TableHead>
              <TableHead>{t.fabrics.supplier}</TableHead>
              <TableHead className="text-right">{t.fabrics.costMeter}</TableHead>
              <TableHead className="text-right">{t.fabrics.sellingPrice}</TableHead>
              <TableHead className="text-right">{t.fabrics.available}</TableHead>
              <TableHead>{t.fabrics.status}</TableHead>
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
                    <Badge variant="destructive">{t.fabrics.outOfStock}</Badge>
                  ) : f.availableMeters <= LOW_STOCK_THRESHOLD ? (
                    <Badge variant="secondary">{t.fabrics.lowStock}</Badge>
                  ) : (
                    <Badge variant="default">{t.fabrics.inStock}</Badge>
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
