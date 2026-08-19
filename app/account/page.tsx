import Link from "next/link";
import Image from "next/image";
import { QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerSignOutButton } from "@/components/account/customer-sign-out-button";
import { ReviewDialog } from "@/components/account/review-dialog";
import { getCurrentCustomer, getMyOrders } from "@/lib/actions/customer-auth";
import { getMyReviewedOrderIds } from "@/lib/actions/reviews";
import { orderStatusLabels, type OrderStatus } from "@/lib/validation/order";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  const { t } = await getServerLanguage();

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/20 px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-serif text-2xl">{t.account.notSignedIn}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.account.notSignedInSubtitle}</p>
          <Button asChild className="mt-6">
            <Link href="/account/login">{t.account.signIn}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const [orders, reviewedOrderIds] = await Promise.all([getMyOrders(), getMyReviewedOrderIds()]);

  return (
    <div className="min-h-screen bg-secondary/10 px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Khaiati" width={56} height={56} className="h-14 w-14 object-contain" />
          </Link>
          <span className="font-serif text-xl tracking-[0.15em]">KHAIATI</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">
              {customer.phone} · {customer.email}
            </p>
          </div>
          <CustomerSignOutButton />
        </div>

        <div>
          <h2 className="mb-3 font-serif text-lg">{t.account.myOrders}</h2>
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {t.account.noOrdersYet}
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.account.orderNo}</TableHead>
                    <TableHead>{t.account.business}</TableHead>
                    <TableHead>{t.account.status}</TableHead>
                    <TableHead>{t.account.due}</TableHead>
                    <TableHead className="text-right">{t.account.total}</TableHead>
                    <TableHead className="text-right">{t.account.balance}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.order_no}</TableCell>
                      <TableCell>{o.business_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{orderStatusLabels[o.status as OrderStatus] ?? o.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(o.due_date)}</TableCell>
                      <TableCell className="text-right">{formatMoney(o.total_price)}</TableCell>
                      <TableCell className="text-right">
                        {formatMoney(Number(o.total_price) - Number(o.paid_amount))}
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/track/${o.tracking_token}`} target="_blank">
                            <QrCode className="h-3.5 w-3.5" />
                            {t.account.track}
                          </Link>
                        </Button>
                        {["completed", "delivered"].includes(o.status) &&
                          !reviewedOrderIds.includes(o.id) && (
                            <ReviewDialog orderId={o.id} businessName={o.business_name} />
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
