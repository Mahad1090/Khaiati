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
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

const statusVariant: Record<PaymentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "outline",
  cancelled: "destructive",
};

export default async function SubscriptionPlansPage() {
  const { t } = await getServerLanguage();
  let plans, subscriptions;
  try {
    [plans, subscriptions] = await Promise.all([listPlans(), listSubscriptions()]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.platformAdmin.subscriptionPlansTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.platformAdmin.subscriptionPlansTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {t.platformAdmin.subscriptionPlansSubtitle}
          </p>
        </div>
        <PlanFormDialog />
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg">{t.platformAdmin.plans}</h2>
        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t.platformAdmin.noPlansYet}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.platformAdmin.name}</TableHead>
                  <TableHead className="text-right">{t.platformAdmin.price}</TableHead>
                  <TableHead className="text-right">{t.platformAdmin.duration}</TableHead>
                  <TableHead className="text-right">{t.platformAdmin.commission}</TableHead>
                  <TableHead>{t.platformAdmin.active}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">{formatMoney(p.price)}</TableCell>
                    <TableCell className="text-right">{p.duration_days} {t.platformAdmin.days}</TableCell>
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
        <h2 className="font-serif text-lg">{t.platformAdmin.businessSubscriptions}</h2>
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t.platformAdmin.noSubscriptionRequests}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.platformAdmin.business}</TableHead>
                  <TableHead>{t.platformAdmin.plan}</TableHead>
                  <TableHead className="text-right">{t.platformAdmin.price}</TableHead>
                  <TableHead>{t.platformAdmin.start}</TableHead>
                  <TableHead>{t.platformAdmin.expiry}</TableHead>
                  <TableHead>{t.platformAdmin.status}</TableHead>
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
