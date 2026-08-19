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
import { getFabricReport } from "@/lib/actions/reports";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FabricReportsPage() {
  let fabrics;
  try {
    fabrics = await getFabricReport();
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
      <h1 className="font-serif text-2xl">Fabric Reports</h1>

      {fabrics.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">No fabrics yet.</CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fabric #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Purchased (m)</TableHead>
                <TableHead className="text-right">Sold (m)</TableHead>
                <TableHead className="text-right">Remaining (m)</TableHead>
                <TableHead className="text-right">Cost/Meter</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
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
                  <TableCell className="text-right">{f.purchased_meters}</TableCell>
                  <TableCell className="text-right">{f.sold_meters}</TableCell>
                  <TableCell className="text-right">{f.remaining_meters}</TableCell>
                  <TableCell className="text-right">{formatMoney(f.price_per_meter)}</TableCell>
                  <TableCell className="text-right">{formatMoney(f.selling_price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
