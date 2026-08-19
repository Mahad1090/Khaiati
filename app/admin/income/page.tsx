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

  let report, entries;
  try {
    [report, entries] = await Promise.all([getProfitLoss(from, to), listIncome(from, to)]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Income</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Income</h1>
          <p className="text-sm text-muted-foreground">
            Sewing and fabric-sales income are tracked automatically from Orders and Fabric Sales. Log anything
            else here.
          </p>
        </div>
        <IncomeFormDialog />
      </div>

      <DateRangeControl from={from} to={to} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sewing (Orders)</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.income.sewing)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fabric Sales</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.income.fabricSales)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Other (Manual)</CardTitle>
          </CardHeader>
          <CardContent className="font-serif text-xl">{formatMoney(report.income.other)}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">Other Income Entries</h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No manual income entries in this period.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
