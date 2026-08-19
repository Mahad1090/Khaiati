import { Card, CardContent } from "@/components/ui/card";
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
import { PlanFormDialog } from "@/components/admin/subscriptions/plan-form-dialog";
import { ConfirmPaymentButton } from "@/components/admin/subscriptions/confirm-payment-button";
import { TogglePlanActive } from "@/components/admin/subscriptions/toggle-plan-active";
import { listPlans, listSubscriptions } from "@/lib/actions/subscriptions";
import { paymentStatusLabels, type PaymentStatus } from "@/lib/validation/subscription";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusVariant: Record<PaymentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "outline",
  cancelled: "destructive",
};

export default async function SubscriptionPlansPage() {
  let plans, subscriptions;
  try {
    [plans, subscriptions] = await Promise.all([listPlans(), listSubscriptions()]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Subscription Plans</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground">
            Platform billing plans and business subscription requests. No payment gateway is wired up —
            confirm payment manually once received off-platform.
          </p>
        </div>
        <PlanFormDialog />
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">Plans</h2>
        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No plans yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">{formatMoney(p.price)}</TableCell>
                    <TableCell className="text-right">{p.duration_days} days</TableCell>
                    <TableCell className="text-right">{p.commission_rate}%</TableCell>
                    <TableCell>
                      <TogglePlanActive id={p.id} isActive={p.is_active} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">Business Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No subscription requests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.business_name}</TableCell>
                    <TableCell>{s.plan_name}</TableCell>
                    <TableCell className="text-right">{formatMoney(s.price)}</TableCell>
                    <TableCell>{formatDate(s.start_date)}</TableCell>
                    <TableCell>{formatDate(s.expiry_date)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[s.payment_status]}>
                        {paymentStatusLabels[s.payment_status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.payment_status === "pending" && <ConfirmPaymentButton id={s.id} />}
                    </TableCell>
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
