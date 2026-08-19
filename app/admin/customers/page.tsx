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
import { CustomerFormDialog } from "@/components/admin/customers/customer-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { searchCustomers } from "@/lib/actions/customers";
import { formatDate } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

async function CustomersTable({ q }: { q: string }) {
  const { t } = await getServerLanguage();
  let customers;
  try {
    customers = await searchCustomers(q);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t.customers.noneFound}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.customers.customerNo}</TableHead>
            <TableHead>{t.customers.name}</TableHead>
            <TableHead>{t.customers.phone}</TableHead>
            <TableHead>{t.customers.registered}</TableHead>
            <TableHead className="text-right">{t.customers.note}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Badge variant="outline">{c.customer_no}</Badge>
              </TableCell>
              <TableCell>
                <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-accent">
                  {c.name}
                </Link>
              </TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>{formatDate(c.created_at)}</TableCell>
              <TableCell className="max-w-[240px] truncate text-right text-muted-foreground">
                {c.note ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function CustomersPage({
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
          <h1 className="font-serif text-2xl">{t.customers.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.customers.subtitle}
          </p>
        </div>
        <CustomerFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder={t.customers.searchPlaceholder} />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">{t.customers.loading}</p>}>
        <CustomersTable q={q} />
      </Suspense>
    </div>
  );
}
