import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { RequestPlanButton } from "@/components/admin/subscriptions/request-plan-button";
import { getMySubscription, listPlans } from "@/lib/actions/subscriptions";
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

export default async function MySubscriptionPage() {
  const { t } = await getServerLanguage();
  let current, plans;
  try {
    [current, plans] = await Promise.all([getMySubscription(), listPlans()]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.platformAdmin.mySubscriptionTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  const activePlans = plans.filter((p) => p.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">{t.platformAdmin.mySubscriptionTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.platformAdmin.mySubscriptionSubtitle}</p>
      </div>

      {current && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.platformAdmin.currentPlan}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl">{current.plan_name}</span>
              <Badge variant={statusVariant[current.payment_status]}>
                {paymentStatusLabels[current.payment_status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatMoney(current.price)} · {t.platformAdmin.started} {formatDate(current.start_date)}
              {current.expiry_date && <> · {t.platformAdmin.expires} {formatDate(current.expiry_date)}</>}
            </p>
            {current.payment_status === "pending" && (
              <p className="text-sm text-muted-foreground">
                {t.platformAdmin.awaitingPayment}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-serif text-lg">{current ? t.platformAdmin.changePlan : t.platformAdmin.chooseAPlan}</h2>
        {activePlans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t.platformAdmin.noPlansAvailable}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePlans.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">{p.name}</CardTitle>
                  <CardDescription>
                    {formatMoney(p.price)} / {p.duration_days} {t.platformAdmin.days}
                    {Number(p.commission_rate) > 0 && <> · {p.commission_rate}% {t.platformAdmin.commission}</>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RequestPlanButton planId={p.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
