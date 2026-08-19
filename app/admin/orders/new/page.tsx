import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { OrderForm } from "@/components/admin/orders/order-form";
import { listDesigns } from "@/lib/actions/designs";
import { getCustomerById } from "@/lib/actions/customers";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer } = await searchParams;
  const { t } = await getServerLanguage();

  let designs;
  let initialCustomer = null;
  try {
    designs = await listDesigns({ activeOnly: true });
    if (customer) {
      initialCustomer = await getCustomerById(customer);
    }
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/orders">
          <ArrowLeft className="h-4 w-4" />
          {t.orders.backToOrders}
        </Link>
      </Button>
      <div>
        <h1 className="font-serif text-2xl">{t.orders.createOrderTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {t.orders.createOrderSubtitle}
        </p>
      </div>
      <OrderForm designs={designs} initialCustomer={initialCustomer} />
    </div>
  );
}
