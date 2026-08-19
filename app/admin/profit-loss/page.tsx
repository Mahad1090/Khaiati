import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { DateRangeControl } from "@/components/admin/finance/date-range-control";
import { getProfitLoss } from "@/lib/actions/finance";
import { expenseCategoryLabels, type ExpenseCategory } from "@/lib/validation/finance";
import { formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

function firstOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from = firstOfMonth(), to = today() } = await searchParams;
  const { t } = await getServerLanguage();

  let report;
  try {
    report = await getProfitLoss(from, to);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.finance.profitLossTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.finance.profitLossTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {t.finance.profitLossSubtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/income">{t.finance.incomeLink}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/expenses">{t.finance.expensesLink}</Link>
          </Button>
        </div>
      </div>

      <DateRangeControl from={from} to={to} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.finance.totalIncome}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-2xl">{formatMoney(report.income.total)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.finance.totalExpenses}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-2xl">{formatMoney(report.expenses.total)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {report.netProfit >= 0 ? t.finance.netProfit : t.finance.netLoss}
            </CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-2xl">
            <span className={report.netProfit < 0 ? "text-destructive" : ""}>
              {formatMoney(Math.abs(report.netProfit))}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.finance.incomeBreakdown}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>{t.finance.sewingOrderPayments}</TableCell>
                  <TableCell className="text-right">{formatMoney(report.income.sewing)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t.finance.fabricSales}</TableCell>
                  <TableCell className="text-right">{formatMoney(report.income.fabricSales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t.finance.otherIncome}</TableCell>
                  <TableCell className="text-right">{formatMoney(report.income.other)}</TableCell>
                </TableRow>
                <TableRow className="font-medium">
                  <TableCell>{t.finance.total}</TableCell>
                  <TableCell className="text-right">{formatMoney(report.income.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.finance.expenseBreakdown}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>{t.finance.workerSalariesWages}</TableCell>
                  <TableCell className="text-right">{formatMoney(report.expenses.workerSalariesWages)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t.finance.workerAdvances}</TableCell>
                  <TableCell className="text-right">{formatMoney(report.expenses.workerAdvances)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t.finance.fabricPurchases}</TableCell>
                  <TableCell className="text-right">{formatMoney(report.expenses.fabricPurchases)}</TableCell>
                </TableRow>
                {(Object.keys(report.expenses.byCategory) as ExpenseCategory[]).map((c) => (
                  <TableRow key={c}>
                    <TableCell>{expenseCategoryLabels[c]}</TableCell>
                    <TableCell className="text-right">{formatMoney(report.expenses.byCategory[c])}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>{t.finance.total}</TableCell>
                  <TableCell className="text-right">{formatMoney(report.expenses.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
