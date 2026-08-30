import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { WorkerFormDialog } from "@/components/admin/workers/worker-form-dialog";
import { AssignmentFormDialog } from "@/components/admin/workers/assignment-form-dialog";
import { AssignmentStatusSelect } from "@/components/admin/workers/assignment-status-select";
import { PaymentFormDialog } from "@/components/admin/workers/payment-form-dialog";
import { AdvanceFormDialog } from "@/components/admin/workers/advance-form-dialog";
import {
  getWorkerById,
  getWorkerAssignments,
  getWorkerPayments,
  getWorkerAdvances,
  getWorkerFinancialSummary,
} from "@/lib/actions/workers";
import {
  workTypeLabels,
  payModelLabels,
  type AssignmentStatus,
  type WorkType,
  type PayModel,
} from "@/lib/validation/worker";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getServerLanguage();

  let worker;
  let assignments, payments, advances, summary;
  try {
    worker = await getWorkerById(id);
    if (worker) {
      [assignments, payments, advances, summary] = await Promise.all([
        getWorkerAssignments(id),
        getWorkerPayments(id),
        getWorkerAdvances(id),
        getWorkerFinancialSummary(id),
      ]);
    }
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }
  if (!worker) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/workers">
          <ArrowLeft className="h-4 w-4" />
          {t.workers.backToWorkers}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl">{worker.name}</h1>
            <Badge variant="outline">{worker.worker_no}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {worker.occupation ?? "—"} · {worker.contact_number ?? "—"}
            {worker.employee_number ? ` · Emp# ${worker.employee_number}` : ""}
          </p>
          {worker.note && <p className="mt-1 text-sm text-muted-foreground">{worker.note}</p>}
        </div>
        <div className="flex gap-2">
          <WorkerFormDialog
            mode="edit"
            workerId={worker.id}
            defaultValues={{
              name: worker.name,
              occupation: worker.occupation ?? "",
              contact_number: worker.contact_number ?? "",
              employee_number: worker.employee_number ?? "",
              salary: worker.salary ? Number(worker.salary) : undefined,
              note: worker.note ?? "",
            }}
            trigger={<Button variant="outline">{t.workers.edit}</Button>}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.workers.wagesEarned}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.totalWages)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.workers.totalPaid}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.totalPaid)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.workers.advances}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.totalAdvances)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.workers.remaining}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.remaining)}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">{t.workers.workAssignments}</h2>
          <AssignmentFormDialog workerId={worker.id} />
        </div>
        {assignments!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t.workers.noAssignmentsYet}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.workers.order}</TableHead>
                  <TableHead>{t.workers.garment}</TableHead>
                  <TableHead>{t.workers.workType}</TableHead>
                  <TableHead>{t.workers.qty}</TableHead>
                  <TableHead>{t.workers.submitted}</TableHead>
                  <TableHead>{t.workers.due}</TableHead>
                  <TableHead>{t.workers.status}</TableHead>
                  <TableHead className="text-right">{t.workers.wage}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments!.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {a.order_no ? (
                        <span className="font-medium">{a.order_no}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{garmentTypeLabels[a.garment_type as GarmentType] ?? a.garment_type}</TableCell>
                    <TableCell>{workTypeLabels[a.work_type as WorkType] ?? a.work_type}</TableCell>
                    <TableCell>{a.quantity}</TableCell>
                    <TableCell>{formatDate(a.submitted_date)}</TableCell>
                    <TableCell>{formatDate(a.due_date)}</TableCell>
                    <TableCell>
                      <AssignmentStatusSelect assignmentId={a.id} status={a.status as AssignmentStatus} />
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(a.wage)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">{t.workers.salaryWagePayments}</h2>
          <PaymentFormDialog workerId={worker.id} />
        </div>
        {payments!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t.workers.noPaymentsYet}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.workers.date}</TableHead>
                  <TableHead>{t.workers.payModel}</TableHead>
                  <TableHead>{t.workers.period}</TableHead>
                  <TableHead>{t.workers.note}</TableHead>
                  <TableHead className="text-right">{t.workers.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments!.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.paid_at)}</TableCell>
                    <TableCell>{payModelLabels[p.pay_model as PayModel] ?? p.pay_model}</TableCell>
                    <TableCell>
                      {p.period_start ? `${formatDate(p.period_start)} – ${formatDate(p.period_end)}` : "—"}
                    </TableCell>
                    <TableCell>{p.note ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatMoney(p.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">{t.workers.advanceSalary}</h2>
          <AdvanceFormDialog workerId={worker.id} />
        </div>
        {advances!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t.workers.noAdvancesYet}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.workers.date}</TableHead>
                  <TableHead>{t.workers.salaryPeriod}</TableHead>
                  <TableHead>{t.workers.reason}</TableHead>
                  <TableHead className="text-right">{t.workers.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances!.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{formatDate(a.advance_date)}</TableCell>
                    <TableCell>{a.salary_period ?? "—"}</TableCell>
                    <TableCell>{a.reason ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatMoney(a.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
