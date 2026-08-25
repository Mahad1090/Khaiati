import { query } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";

// ---------------------------------------------------------------------------
// Order reports
// ---------------------------------------------------------------------------
export type OrderReportRow = {
  id: string;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  order_date: string;
  due_date: string | null;
  total_price: string;
  paid_amount: string;
  is_overdue: boolean;
};

export async function getOrderReport(): Promise<{
  all: OrderReportRow[];
  completed: OrderReportRow[];
  incomplete: OrderReportRow[];
  overdue: OrderReportRow[];
}> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<OrderReportRow>(
    `select
       o.id, o.order_no, c.name as customer_name, c.phone as customer_phone,
       o.status, o.order_date, o.due_date,
       coalesce((select sum(total_price) from order_items where order_id = o.id), 0) as total_price,
       coalesce((select sum(amount) from order_payments where order_id = o.id), 0) as paid_amount,
       (o.due_date is not null and o.due_date < current_date and o.status not in ('completed', 'delivered', 'canceled')) as is_overdue
     from orders o
     join customers c on c.id = o.customer_id
     where o.business_id = $1
     order by o.created_at desc`,
    [businessId]
  );
  return {
    all: rows,
    completed: rows.filter((r) => r.status === "completed" || r.status === "delivered"),
    incomplete: rows.filter((r) => r.status !== "completed" && r.status !== "delivered" && r.status !== "canceled"),
    overdue: rows.filter((r) => r.is_overdue),
  };
}

// ---------------------------------------------------------------------------
// Customer reports
// ---------------------------------------------------------------------------
export type CustomerReportRow = {
  id: string;
  customer_no: string;
  name: string;
  phone: string;
  created_at: string;
  total_orders: number;
  total_paid: string;
  outstanding_balance: string;
};

export async function getCustomerReport(): Promise<{
  all: CustomerReportRow[];
  newThisMonth: CustomerReportRow[];
  withBalance: CustomerReportRow[];
}> {
  const businessId = await getCurrentBusinessId();
  // Only customers this business has actually served (business_customers),
  // with totals scoped to orders placed with this business — never another
  // business's relationship with the same shared customer identity.
  const { rows } = await query<CustomerReportRow>(
    `select
       c.id, c.customer_no, c.name, c.phone, c.created_at,
       count(distinct o.id)::int as total_orders,
       coalesce((select sum(amount) from order_payments p join orders o2 on o2.id = p.order_id where o2.customer_id = c.id and o2.business_id = $1), 0) as total_paid,
       coalesce((select sum(total_price) from order_items oi join orders o3 on o3.id = oi.order_id where o3.customer_id = c.id and o3.business_id = $1), 0)
         - coalesce((select sum(amount) from order_payments p2 join orders o4 on o4.id = p2.order_id where o4.customer_id = c.id and o4.business_id = $1), 0) as outstanding_balance
     from customers c
     join business_customers bc on bc.customer_id = c.id and bc.business_id = $1
     left join orders o on o.customer_id = c.id and o.business_id = $1
     group by c.id
     order by c.created_at desc`,
    [businessId]
  );
  return {
    all: rows,
    newThisMonth: rows.filter((r) => {
      const created = new Date(r.created_at);
      const now = new Date();
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    }),
    withBalance: rows.filter((r) => Number(r.outstanding_balance) > 0),
  };
}

// ---------------------------------------------------------------------------
// Worker reports
// ---------------------------------------------------------------------------
export type WorkerReportRow = {
  id: string;
  worker_no: string;
  name: string;
  occupation: string | null;
  assigned_count: number;
  completed_count: number;
  pending_count: number;
  total_wages: string;
  total_paid: string;
  total_advances: string;
  pending_salary: string;
};

export async function getWorkerReport(from?: string, to?: string): Promise<WorkerReportRow[]> {
  const businessId = await getCurrentBusinessId();
  const fromDate = from || null;
  const toDate = to || null;
  const { rows } = await query<WorkerReportRow>(
    `select
       w.id, w.worker_no, w.name, w.occupation,
       count(wa.id)::int as assigned_count,
       count(wa.id) filter (where wa.status = 'completed')::int as completed_count,
       count(wa.id) filter (where wa.status in ('assigned', 'in_progress'))::int as pending_count,
       coalesce((
         select sum(wage * quantity) from worker_assignments
         where worker_id = w.id and status = 'completed'
           and ($2::date is null or submitted_date >= $2::date)
           and ($3::date is null or submitted_date <= $3::date)
       ), 0) as total_wages,
       coalesce((
         select sum(amount) from worker_payments
         where worker_id = w.id
           and ($2::date is null or paid_at >= $2::date)
           and ($3::date is null or paid_at <= $3::date)
       ), 0) as total_paid,
       coalesce((
         select sum(amount) from worker_advances
         where worker_id = w.id
           and ($2::date is null or advance_date >= $2::date)
           and ($3::date is null or advance_date <= $3::date)
       ), 0) as total_advances,
       coalesce((
         select sum(wage * quantity) from worker_assignments
         where worker_id = w.id and status = 'completed'
           and ($2::date is null or submitted_date >= $2::date)
           and ($3::date is null or submitted_date <= $3::date)
       ), 0)
         - coalesce((
           select sum(amount) from worker_payments
           where worker_id = w.id
             and ($2::date is null or paid_at >= $2::date)
             and ($3::date is null or paid_at <= $3::date)
         ), 0)
         - coalesce((
           select sum(amount) from worker_advances
           where worker_id = w.id
             and ($2::date is null or advance_date >= $2::date)
             and ($3::date is null or advance_date <= $3::date)
         ), 0) as pending_salary
     from workers w
     left join worker_assignments wa on wa.worker_id = w.id
       and ($2::date is null or wa.submitted_date >= $2::date)
       and ($3::date is null or wa.submitted_date <= $3::date)
     where w.business_id = $1
     group by w.id
     order by w.created_at desc`,
    [businessId, fromDate, toDate]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Fabric reports
// ---------------------------------------------------------------------------
export type FabricReportRow = {
  id: string;
  fabric_no: string;
  name: string;
  color: string | null;
  supplier_name: string | null;
  price_per_meter: string;
  selling_price: string;
  purchased_meters: string;
  sold_meters: string;
  remaining_meters: string;
};

export async function getFabricReport(): Promise<FabricReportRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<FabricReportRow>(
    `select
       f.id, f.fabric_no, f.name, f.color, s.company_name as supplier_name,
       f.price_per_meter, f.selling_price,
       coalesce((select sum(quantity_meters) from fabric_stock_movements where fabric_id = f.id and movement_type = 'purchase'), 0) as purchased_meters,
       coalesce((select -sum(quantity_meters) from fabric_stock_movements where fabric_id = f.id and movement_type = 'sale'), 0) as sold_meters,
       coalesce((select sum(quantity_meters) from fabric_stock_movements where fabric_id = f.id), 0) as remaining_meters
     from fabrics f
     left join fabric_suppliers s on s.id = f.supplier_id
     where f.business_id = $1
     order by f.created_at desc`,
    [businessId]
  );
  return rows;
}
