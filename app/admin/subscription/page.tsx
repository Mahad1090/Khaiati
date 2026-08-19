import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { RequestPlanButton } from "@/components/admin/subscriptions/request-plan-button";
import { getMySubscription, listPlans } from "@/lib/actions/subscriptions";
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

export default async function MySubscriptionPage() {
  let current, plans;
  try {
    [current, plans] = await Promise.all([getMySubscription(), listPlans()]);
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Subscription</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  const activePlans = plans.filter((p) => p.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Subscription</h1>
        <p className="text-sm text-muted-foreground">Your Khaiati platform plan.</p>
      </div>

      {current && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-serif text-xl">{current.plan_name}</span>
              <Badge variant={statusVariant[current.payment_status]}>
                {paymentStatusLabels[current.payment_status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatMoney(current.price)} · Started {formatDate(current.start_date)}
              {current.expiry_date && <> · Expires {formatDate(current.expiry_date)}</>}
            </p>
            {current.payment_status === "pending" && (
              <p className="text-sm text-muted-foreground">
                Awaiting payment confirmation from Khaiati. We&apos;ll follow up with payment instructions.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-serif text-lg">{current ? "Change Plan" : "Choose a Plan"}</h2>
        {activePlans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No plans available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePlans.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">{p.name}</CardTitle>
                  <CardDescription>
                    {formatMoney(p.price)} / {p.duration_days} days
                    {Number(p.commission_rate) > 0 && <> · {p.commission_rate}% commission</>}
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
