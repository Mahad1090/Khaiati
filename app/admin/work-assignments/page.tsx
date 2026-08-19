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
import { GlobalAssignmentFormDialog } from "@/components/admin/workers/global-assignment-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getAllAssignments } from "@/lib/actions/workers";
import {
  assignmentStatusLabels,
  workTypeLabels,
  type AssignmentStatus,
  type WorkType,
} from "@/lib/validation/worker";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

async function AssignmentsTable({ q }: { q: string }) {
  let rows;
  try {
    rows = await getAllAssignments(q);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No work assignments found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Worker</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Garment</TableHead>
            <TableHead>Work Type</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Wage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <Link href={`/admin/workers/${a.worker_id}`} className="font-medium hover:text-accent">
                  {a.worker_name}
                </Link>
              </TableCell>
              <TableCell>{a.order_no ?? "—"}</TableCell>
              <TableCell>{garmentTypeLabels[a.garment_type as GarmentType] ?? a.garment_type}</TableCell>
              <TableCell>{workTypeLabels[a.work_type as WorkType] ?? a.work_type}</TableCell>
              <TableCell>{a.quantity}</TableCell>
              <TableCell>{formatDate(a.submitted_date)}</TableCell>
              <TableCell>{formatDate(a.due_date)}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {assignmentStatusLabels[a.status as AssignmentStatus] ?? a.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatMoney(a.wage)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function WorkAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Work Assignments</h1>
          <p className="text-sm text-muted-foreground">Work assigned to workers, linked to orders.</p>
        </div>
        <GlobalAssignmentFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder="Search by worker or order number..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <AssignmentsTable q={q} />
      </Suspense>
    </div>
  );
}
