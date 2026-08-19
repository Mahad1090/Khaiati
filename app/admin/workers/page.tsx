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
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

async function WorkersTable({ q }: { q: string }) {
  const { t } = await getServerLanguage();
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
          {t.workers.noneFound}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.workers.workerNo}</TableHead>
            <TableHead>{t.workers.name}</TableHead>
            <TableHead>{t.workers.occupation}</TableHead>
            <TableHead>{t.workers.contact}</TableHead>
            <TableHead>{t.workers.employeeNo}</TableHead>
            <TableHead className="text-right">{t.workers.baseSalary}</TableHead>
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
  const { t } = await getServerLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.workers.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.workers.subtitle}
          </p>
        </div>
        <WorkerFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder={t.workers.searchPlaceholder} />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">{t.workers.loading}</p>}>
        <WorkersTable q={q} />
      </Suspense>
    </div>
  );
}
