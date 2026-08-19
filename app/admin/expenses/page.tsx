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
import { DateRangeControl } from "@/components/admin/finance/date-range-control";
import { ExpenseFormDialog } from "@/components/admin/finance/expense-form-dialog";
import { getProfitLoss, listExpenses } from "@/lib/actions/finance";
import { expenseCategoryLabels, type ExpenseCategory } from "@/lib/validation/finance";
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

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from = firstOfMonth(), to = today() } = await searchParams;
  const { t } = await getServerLanguage();

  let report, entries;
  try {
    [report, entries] = await Promise.all([getProfitLoss(from, to), listExpenses(from, to)]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.finance.expensesTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.finance.expensesTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {t.finance.expensesSubtitle}
          </p>
        </div>
        <ExpenseFormDialog />
      </div>

      <DateRangeControl from={from} to={to} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.finance.workerSalariesWages}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.expenses.workerSalariesWages)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.finance.workerAdvances}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.expenses.workerAdvances)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.finance.fabricPurchases}</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.expenses.fabricPurchases)}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">{t.finance.shopExpenses}</h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t.finance.noShopExpenses}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.finance.hashCol}</TableHead>
                  <TableHead>{t.finance.date}</TableHead>
                  <TableHead>{t.finance.category}</TableHead>
                  <TableHead>{t.finance.note}</TableHead>
                  <TableHead className="text-right">{t.finance.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.expense_no}</TableCell>
                    <TableCell>{formatDate(e.expense_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expenseCategoryLabels[e.category as ExpenseCategory]}</Badge>
                    </TableCell>
                    <TableCell>{e.note ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatMoney(e.amount)}</TableCell>
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
