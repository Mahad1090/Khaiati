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
import { SearchBox } from "@/components/admin/search-box";
import { FabricFormDialog } from "@/components/admin/fabrics/fabric-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { listFabrics } from "@/lib/actions/fabrics";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

async function FabricsTable({ q }: { q: string }) {
  let fabrics;
  try {
    fabrics = await listFabrics({ search: q });
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (fabrics.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No fabrics found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fabric #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Price/Meter</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead className="text-right">Available</TableHead>
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
              <TableCell>{f.fabric_type ?? "—"}</TableCell>
              <TableCell>{f.color ?? "—"}</TableCell>
              <TableCell>{f.supplier_name ?? "—"}</TableCell>
              <TableCell className="text-right">{formatMoney(f.price_per_meter)}</TableCell>
              <TableCell className="text-right">{formatMoney(f.selling_price)}</TableCell>
              <TableCell className="text-right">
                <Badge variant={f.availableMeters <= 0 ? "destructive" : "secondary"}>
                  {f.availableMeters} {f.unit}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function FabricsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Fabrics</h1>
          <p className="text-sm text-muted-foreground">Catalogue, pricing, and available stock.</p>
        </div>
        <FabricFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder="Search fabrics..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <FabricsTable q={q} />
      </Suspense>
    </div>
  );
}
