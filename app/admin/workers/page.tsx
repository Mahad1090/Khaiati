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
import { WorkerFormDialog } from "@/components/admin/workers/worker-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { searchWorkers } from "@/lib/actions/workers";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

async function WorkersTable({ q }: { q: string }) {
  let workers;
  try {
    workers = await searchWorkers(q);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (workers.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No workers found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Worker #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Employee #</TableHead>
            <TableHead className="text-right">Base Salary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((w) => (
            <TableRow key={w.id}>
              <TableCell>
                <Badge variant="outline">{w.worker_no}</Badge>
              </TableCell>
              <TableCell>
                <Link href={`/admin/workers/${w.id}`} className="font-medium hover:text-accent">
                  {w.name}
                </Link>
              </TableCell>
              <TableCell>{w.occupation ?? "—"}</TableCell>
              <TableCell>{w.contact_number ?? "—"}</TableCell>
              <TableCell>{w.employee_number ?? "—"}</TableCell>
              <TableCell className="text-right">{w.salary ? formatMoney(w.salary) : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Workers</h1>
          <p className="text-sm text-muted-foreground">
            Search by worker number, name, phone, or employee number.
          </p>
        </div>
        <WorkerFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder="Search workers..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <WorkersTable q={q} />
      </Suspense>
    </div>
  );
}
