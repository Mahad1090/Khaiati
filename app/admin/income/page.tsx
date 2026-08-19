import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { IncomeFormDialog } from "@/components/admin/finance/income-form-dialog";
import { getProfitLoss, listIncome } from "@/lib/actions/finance";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

function firstOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from = firstOfMonth(), to = today() } = await searchParams;
  const { t } = await getServerLanguage();

  let report, entries;
  try {
    [report, entries] = await Promise.all([getProfitLoss(from, to), listIncome(from, to)]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.finance.incomeTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.finance.incomeTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {t.finance.incomeSubtitle}
          </p>
        </div>
        <IncomeFormDialog />
      </div>

      <DateRangeControl from={from} to={to} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.finance.sewingOrders}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.income.sewing)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.finance.fabricSales}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.income.fabricSales)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.finance.otherManual}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.income.other)}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">{t.finance.otherIncomeEntries}</h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t.finance.noManualIncome}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.finance.hashCol}</TableHead>
                  <TableHead>{t.finance.date}</TableHead>
                  <TableHead>{t.finance.note}</TableHead>
                  <TableHead className="text-right">{t.finance.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.income_no}</TableCell>
                    <TableCell>{formatDate(i.income_date)}</TableCell>
                    <TableCell>{i.note ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatMoney(i.amount)}</TableCell>
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
