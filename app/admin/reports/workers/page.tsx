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
import { DateRangeControl } from "@/components/admin/finance/date-range-control";
import { getWorkerReport } from "@/lib/actions/reports";
import { formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function WorkerReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from = "", to = "" } = await searchParams;
  const { t } = await getServerLanguage();
  let workers;
  try {
    workers = await getWorkerReport(from || undefined, to || undefined);
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
      <h1 className="font-serif text-2xl">{t.reports.workerReportsTitle}</h1>

      <DateRangeControl from={from} to={to} />

      {workers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">{t.reports.noWorkersYet}</CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.reports.workerNo}</TableHead>
                <TableHead>{t.reports.name}</TableHead>
                <TableHead className="text-right">{t.reports.assigned}</TableHead>
                <TableHead className="text-right">{t.reports.completed}</TableHead>
                <TableHead className="text-right">{t.reports.pending}</TableHead>
                <TableHead className="text-right">{t.reports.wagesEarned}</TableHead>
                <TableHead className="text-right">{t.reports.paid}</TableHead>
                <TableHead className="text-right">{t.reports.advances}</TableHead>
                <TableHead className="text-right">{t.reports.pendingSalary}</TableHead>
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
