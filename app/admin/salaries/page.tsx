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
import { SearchBox } from "@/components/admin/search-box";
import { GlobalPaymentFormDialog } from "@/components/admin/workers/global-payment-form-dialog";
import { GlobalAdvanceFormDialog } from "@/components/admin/workers/global-advance-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { getAllWorkerPayments, getAllWorkerAdvances } from "@/lib/actions/workers";
import { payModelLabels, type PayModel } from "@/lib/validation/worker";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

async function SalariesTables({ q }: { q: string }) {
  const { t } = await getServerLanguage();
  let payments, advances;
  try {
    [payments, advances] = await Promise.all([getAllWorkerPayments(q), getAllWorkerAdvances(q)]);
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-serif text-lg">{t.workers.salaryWagePayments}</h2>
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t.workers.noPaymentsFound}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.workers.worker}</TableHead>
                  <TableHead>{t.workers.payModel}</TableHead>
                  <TableHead>{t.workers.period}</TableHead>
                  <TableHead>{t.workers.date}</TableHead>
                  <TableHead>{t.workers.note}</TableHead>
                  <TableHead className="text-right">{t.workers.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/admin/workers/${p.worker_id}`} className="font-medium hover:text-accent">
                        {p.worker_name}
                      </Link>
                    </TableCell>
                    <TableCell>{payModelLabels[p.pay_model as PayModel] ?? p.pay_model}</TableCell>
                    <TableCell>
                      {p.period_start ? `${formatDate(p.period_start)} – ${formatDate(p.period_end)}` : "—"}
                    </TableCell>
                    <TableCell>{formatDate(p.paid_at)}</TableCell>
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
        <h2 className="font-serif text-lg">{t.workers.advanceSalary}</h2>
        {advances.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t.workers.noAdvancesFound}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.workers.worker}</TableHead>
                  <TableHead>{t.workers.date}</TableHead>
                  <TableHead>{t.workers.salaryPeriod}</TableHead>
                  <TableHead>{t.workers.reason}</TableHead>
                  <TableHead>{t.workers.note}</TableHead>
                  <TableHead className="text-right">{t.workers.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link href={`/admin/workers/${a.worker_id}`} className="font-medium hover:text-accent">
                        {a.worker_name}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(a.advance_date)}</TableCell>
                    <TableCell>{a.salary_period ?? "—"}</TableCell>
                    <TableCell>{a.reason ?? "—"}</TableCell>
                    <TableCell>{a.note ?? "—"}</TableCell>
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

export default async function SalariesPage({
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
          <h1 className="font-serif text-2xl">{t.workers.salariesTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {t.workers.salariesSubtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <GlobalPaymentFormDialog />
          <GlobalAdvanceFormDialog />
        </div>
      </div>

      <Suspense>
        <SearchBox placeholder={t.workers.searchByWorker} />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">{t.workers.loading}</p>}>
        <SalariesTables q={q} />
      </Suspense>
    </div>
  );
}
