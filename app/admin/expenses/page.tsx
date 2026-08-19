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

  let report, entries;
  try {
    [report, entries] = await Promise.all([getProfitLoss(from, to), listExpenses(from, to)]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Expenses</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Worker salaries/wages/advances and fabric purchases are tracked automatically from Salaries and
            Fabric Purchases. Log shop-level expenses here.
          </p>
        </div>
        <ExpenseFormDialog />
      </div>

      <DateRangeControl from={from} to={to} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Worker Salaries / Wages</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.expenses.workerSalariesWages)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Worker Advances</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.expenses.workerAdvances)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fabric Purchases</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.expenses.fabricPurchases)}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">Shop Expenses</h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No shop expense entries in this period.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
