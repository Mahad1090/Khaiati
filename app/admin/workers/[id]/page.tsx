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
  assignmentStatusLabels,
  workTypeLabels,
  payModelLabels,
  type AssignmentStatus,
  type WorkType,
  type PayModel,
} from "@/lib/validation/worker";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
          Back to workers
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
            trigger={<Button variant="outline">Edit</Button>}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wages Earned</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.totalWages)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.totalPaid)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Advances</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.totalAdvances)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(summary!.remaining)}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">Work Assignments</h2>
          <AssignmentFormDialog workerId={worker.id} />
        </div>
        {assignments!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No assignments yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
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
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">Salary / Wage Payments</h2>
          <PaymentFormDialog workerId={worker.id} />
        </div>
        {payments!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No payments yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pay Model</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
          <h2 className="font-serif text-lg">Advance Salary</h2>
          <AdvanceFormDialog workerId={worker.id} />
        </div>
        {advances!.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No advances yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Salary Period</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
