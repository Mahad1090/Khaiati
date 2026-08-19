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
import { SupplierFormDialog } from "@/components/admin/suppliers/supplier-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { searchSuppliers } from "@/lib/actions/suppliers";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

async function SuppliersTable({ q }: { q: string }) {
  const { t } = await getServerLanguage();
  let suppliers;
  try {
    suppliers = await searchSuppliers(q);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t.suppliers.noneFound}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.suppliers.supplierNo}</TableHead>
            <TableHead>{t.suppliers.company}</TableHead>
            <TableHead>{t.suppliers.contactPerson}</TableHead>
            <TableHead>{t.suppliers.phone}</TableHead>
            <TableHead>{t.suppliers.companyNo}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <Badge variant="outline">{s.supplier_no}</Badge>
              </TableCell>
              <TableCell>
                <Link href={`/admin/suppliers/${s.id}`} className="font-medium hover:text-accent">
                  {s.company_name}
                </Link>
              </TableCell>
              <TableCell>{s.contact_person ?? "—"}</TableCell>
              <TableCell>{s.phone ?? "—"}</TableCell>
              <TableCell>{s.company_number ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { t } = await getServerLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.suppliers.title}</h1>
          <p className="text-sm text-muted-foreground">{t.suppliers.subtitle}</p>
        </div>
        <SupplierFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder={t.suppliers.searchPlaceholder} />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">{t.suppliers.loading}</p>}>
        <SuppliersTable q={q} />
      </Suspense>
    </div>
  );
}
