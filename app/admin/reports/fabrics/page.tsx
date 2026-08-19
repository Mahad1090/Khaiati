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
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function FabricReportsPage() {
  const { t } = await getServerLanguage();
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
          {t.reports.backToReports}
        </Link>
      </Button>
      <h1 className="font-serif text-2xl">{t.reports.fabricReportsTitle}</h1>

      {fabrics.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">{t.reports.noFabricsYet}</CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.reports.fabricNo}</TableHead>
                <TableHead>{t.reports.name}</TableHead>
                <TableHead>{t.reports.color}</TableHead>
                <TableHead>{t.reports.supplier}</TableHead>
                <TableHead className="text-right">{t.reports.purchasedM}</TableHead>
                <TableHead className="text-right">{t.reports.soldM}</TableHead>
                <TableHead className="text-right">{t.reports.remainingM}</TableHead>
                <TableHead className="text-right">{t.reports.costMeter}</TableHead>
                <TableHead className="text-right">{t.reports.salePrice}</TableHead>
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
