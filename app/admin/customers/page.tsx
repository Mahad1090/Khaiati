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

export const dynamic = "force-dynamic";

async function CustomersTable({ q }: { q: string }) {
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
          No customers found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Note</TableHead>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Search by customer number, name, or phone.
          </p>
        </div>
        <CustomerFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder="Search customers..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <CustomersTable q={q} />
      </Suspense>
    </div>
  );
}
