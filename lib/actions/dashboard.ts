import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";

export type PlatformStats = {
  totalBusinesses: number;
  pendingBusinesses: number;
  approvedBusinesses: number;
  totalCustomers: number;
  totalOrders: number;
  platformRevenue: number;
  activeSubscriptions: number;
  pendingSubscriptionPayments: number;
};

/** Platform-admin dashboard — aggregated across every business, not one. */
export async function getPlatformStats(): Promise<PlatformStats> {
  const [{ rows: bizRows }, { rows: custRows }, { rows: orderRows }, { rows: revRows }, { rows: subRows }] =
    await Promise.all([
      query<{ status: string; count: string }>(`select status, count(*)::text from businesses group by status`),
      query<{ count: string }>(`select count(*) from customers`),
      query<{ count: string }>(`select count(*) from orders`),
      query<{ total: string }>(
        `select
           coalesce((select sum(amount) from order_payments), 0)
           + coalesce((select sum(amount) from fabric_sale_payments), 0) as total`
      ),
      query<{ payment_status: string; count: string }>(
        `select payment_status, count(*)::text from business_subscriptions group by payment_status`
      ),
    ]);

  const businessCounts: Record<string, number> = {};
  for (const row of bizRows) businessCounts[row.status] = Number(row.count);

  const subCounts: Record<string, number> = {};
  for (const row of subRows) subCounts[row.payment_status] = Number(row.count);

  return {
    totalBusinesses: Object.values(businessCounts).reduce((s, n) => s + n, 0),
    pendingBusinesses: businessCounts.pending ?? 0,
    approvedBusinesses: businessCounts.approved ?? 0,
    totalCustomers: Number(custRows[0]?.count ?? 0),
    totalOrders: Number(orderRows[0]?.count ?? 0),
    platformRevenue: Number(revRows[0]?.total ?? 0),
    activeSubscriptions: subCounts.paid ?? 0,
    pendingSubscriptionPayments: subCounts.pending ?? 0,
  };
}

export type DashboardStats = {
  totalCustomers: number;
  activeOrders: number;
  pendingOrders: number;
  completedOrders: number;
  ordersDueSoon: number; // due within 7 days, not yet delivered/canceled
  totalBilled: number;
  totalCollected: number;
  outstandingBalance: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const businessId = await getCurrentBusinessId();

  const [{ rows: customerRows }, { rows: orderRows }, { rows: financeRows }] =
    await Promise.all([
      // "Customers" on a business dashboard means customers that business has
      // served (business_customers), not every customer on the marketplace.
      query<{ count: string }>(
        `select count(*) from business_customers where business_id = $1`,
        [businessId]
      ),
      query<{
        active: string;
        pending: string;
        completed: string;
        due_soon: string;
      }>(
        `select
           count(*) filter (
             where status not in ('completed', 'delivered', 'canceled')
           ) as active,
           count(*) filter (where status = 'new_order') as pending,
           count(*) filter (where status in ('completed', 'delivered')) as completed,
           count(*) filter (
             where status not in ('delivered', 'canceled')
               and due_date is not null
               and due_date <= current_date + interval '7 days'
           ) as due_soon
         from orders
         where business_id = $1`,
        [businessId]
      ),
      query<{ total_billed: string; total_paid: string }>(
        `select
           coalesce((select sum(oi.total_price) from order_items oi
                     join orders o on o.id = oi.order_id
                     where o.business_id = $1), 0) as total_billed,
           coalesce((select sum(p.amount) from order_payments p
                     join orders o on o.id = p.order_id
                     where o.business_id = $1), 0) as total_paid`,
        [businessId]
      ),
    ]);

  const totalBilled = Number(financeRows[0]?.total_billed ?? 0);
  const totalCollected = Number(financeRows[0]?.total_paid ?? 0);

  return {
    totalCustomers: Number(customerRows[0]?.count ?? 0),
    activeOrders: Number(orderRows[0]?.active ?? 0),
    pendingOrders: Number(orderRows[0]?.pending ?? 0),
    completedOrders: Number(orderRows[0]?.completed ?? 0),
    ordersDueSoon: Number(orderRows[0]?.due_soon ?? 0),
    totalBilled,
    totalCollected,
    outstandingBalance: totalBilled - totalCollected,
  };
}
