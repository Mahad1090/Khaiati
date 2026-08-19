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
import { getWorkerReport } from "@/lib/actions/reports";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function WorkerReportsPage() {
  let workers;
  try {
    workers = await getWorkerReport();
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
      <h1 className="font-serif text-2xl">Worker Reports</h1>

      {workers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">No workers yet.</CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Wages Earned</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Advances</TableHead>
                <TableHead className="text-right">Pending Salary</TableHead>
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
                  <TableCell className="text-right">{w.assigned_count}</TableCell>
                  <TableCell className="text-right">{w.completed_count}</TableCell>
                  <TableCell className="text-right">{w.pending_count}</TableCell>
                  <TableCell className="text-right">{formatMoney(w.total_wages)}</TableCell>
                  <TableCell className="text-right">{formatMoney(w.total_paid)}</TableCell>
                  <TableCell className="text-right">{formatMoney(w.total_advances)}</TableCell>
                  <TableCell className="text-right">{formatMoney(w.pending_salary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
