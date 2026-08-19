-- Khaiati — Phase 2 step 2: tenant-scope Workers, Fabrics, Suppliers, Finance.
-- Run after 0010_tenant_backfill.sql.
--
-- Same pattern as orders in 0010: business_id added directly to the "root"
-- entity of each area (workers, fabric_suppliers, fabrics, fabric_purchases,
-- fabric_sales, income, expenses) and backfilled to the default business.
-- Child tables (worker_assignments, worker_payments, worker_advances,
-- fabric_purchase_payments, fabric_sale_payments, fabric_stock_movements)
-- are NOT given their own business_id — they're scoped by joining to their
-- parent, exactly like order_items/order_payments are scoped via orders.

do $$
declare
  default_business_id uuid;
begin
  select id into default_business_id from businesses where slug = 'khaiati-default';
  if default_business_id is null then
    raise exception 'Default business not found — run 0010_tenant_backfill.sql first.';
  end if;

  -- workers
  alter table workers add column if not exists business_id uuid references businesses (id) on delete restrict;
  update workers set business_id = default_business_id where business_id is null;
  alter table workers alter column business_id set not null;

  -- fabric_suppliers
  alter table fabric_suppliers add column if not exists business_id uuid references businesses (id) on delete restrict;
  update fabric_suppliers set business_id = default_business_id where business_id is null;
  alter table fabric_suppliers alter column business_id set not null;

  -- fabrics
  alter table fabrics add column if not exists business_id uuid references businesses (id) on delete restrict;
  update fabrics set business_id = default_business_id where business_id is null;
  alter table fabrics alter column business_id set not null;

  -- fabric_purchases
  alter table fabric_purchases add column if not exists business_id uuid references businesses (id) on delete restrict;
  update fabric_purchases set business_id = default_business_id where business_id is null;
  alter table fabric_purchases alter column business_id set not null;

  -- fabric_sales
  alter table fabric_sales add column if not exists business_id uuid references businesses (id) on delete restrict;
  update fabric_sales set business_id = default_business_id where business_id is null;
  alter table fabric_sales alter column business_id set not null;

  -- income
  alter table income add column if not exists business_id uuid references businesses (id) on delete restrict;
  update income set business_id = default_business_id where business_id is null;
  alter table income alter column business_id set not null;

  -- expenses
  alter table expenses add column if not exists business_id uuid references businesses (id) on delete restrict;
  update expenses set business_id = default_business_id where business_id is null;
  alter table expenses alter column business_id set not null;
end $$;

create index if not exists idx_workers_business on workers (business_id);
create index if not exists idx_fabric_suppliers_business on fabric_suppliers (business_id);
create index if not exists idx_fabrics_business on fabrics (business_id);
create index if not exists idx_fabric_purchases_business on fabric_purchases (business_id);
create index if not exists idx_fabric_sales_business on fabric_sales (business_id);
create index if not exists idx_income_business on income (business_id);
create index if not exists idx_expenses_business on expenses (business_id);
