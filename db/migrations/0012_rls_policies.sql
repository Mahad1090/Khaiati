-- Khaiati — Row Level Security (doc §34-36), defense-in-depth under the
-- query-layer tenant scoping already in lib/actions/*.ts.
--
-- IMPORTANT — read before assuming this is "on":
-- RLS only has teeth if the database connection Next.js uses is NOT a
-- superuser and does NOT have BYPASSRLS (table owners and superusers skip
-- RLS entirely by default in Postgres). If DATABASE_URL currently connects
-- as the Postgres superuser/table owner (the common default for a fresh
-- database), these policies are inert — they exist, but Postgres won't
-- check them. To actually activate this layer:
--
--   1. Create a restricted role and point DATABASE_URL at it:
--        create role khaiati_app login password '...' nosuperuser nobypassrls;
--        grant usage on schema public to khaiati_app;
--        grant select, insert, update, delete on all tables in schema public to khaiati_app;
--        alter default privileges in schema public grant select, insert, update, delete on tables to khaiati_app;
--   2. Every query must run through lib/db.ts's queryScoped()/withTenantTransaction()
--      helpers (added alongside this migration), which set the
--      app.current_business_id session variable these policies read. Plain
--      query()/withTransaction() calls bypass tenant context entirely and
--      will simply see zero rows under RLS — that's a signal something
--      wasn't migrated to the scoped helper, not a security bug.
--
-- Run after 0011_tenant_scope_workers_fabrics_finance.sql.

-- Tables with business_id directly on them.
do $$
declare
  t text;
begin
  foreach t in array array[
    'orders', 'workers', 'fabric_suppliers', 'fabrics', 'fabric_purchases',
    'fabric_sales', 'income', 'expenses', 'business_customers',
    'business_employees', 'products', 'services', 'reviews', 'business_settings'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists tenant_isolation on %I;', t);
    execute format(
      'create policy tenant_isolation on %I using (business_id = current_setting(''app.current_business_id'', true)::uuid) with check (business_id = current_setting(''app.current_business_id'', true)::uuid);',
      t
    );
  end loop;
end $$;

-- Child tables scoped via their parent (mirrors how the query layer already
-- joins to the parent to filter — see lib/actions/*.ts comments).
alter table order_items enable row level security;
drop policy if exists tenant_isolation on order_items;
create policy tenant_isolation on order_items using (
  exists (select 1 from orders o where o.id = order_items.order_id
          and o.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table garment_measurements enable row level security;
drop policy if exists tenant_isolation on garment_measurements;
create policy tenant_isolation on garment_measurements using (
  exists (select 1 from order_items oi join orders o on o.id = oi.order_id
          where oi.id = garment_measurements.order_item_id
          and o.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table order_payments enable row level security;
drop policy if exists tenant_isolation on order_payments;
create policy tenant_isolation on order_payments using (
  exists (select 1 from orders o where o.id = order_payments.order_id
          and o.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table worker_assignments enable row level security;
drop policy if exists tenant_isolation on worker_assignments;
create policy tenant_isolation on worker_assignments using (
  exists (select 1 from workers w where w.id = worker_assignments.worker_id
          and w.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table worker_payments enable row level security;
drop policy if exists tenant_isolation on worker_payments;
create policy tenant_isolation on worker_payments using (
  exists (select 1 from workers w where w.id = worker_payments.worker_id
          and w.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table worker_advances enable row level security;
drop policy if exists tenant_isolation on worker_advances;
create policy tenant_isolation on worker_advances using (
  exists (select 1 from workers w where w.id = worker_advances.worker_id
          and w.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table employee_skills enable row level security;
drop policy if exists tenant_isolation on employee_skills;
create policy tenant_isolation on employee_skills using (
  exists (select 1 from business_employees e where e.id = employee_skills.employee_id
          and e.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table fabric_purchase_payments enable row level security;
drop policy if exists tenant_isolation on fabric_purchase_payments;
create policy tenant_isolation on fabric_purchase_payments using (
  exists (select 1 from fabric_purchases p where p.id = fabric_purchase_payments.purchase_id
          and p.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table fabric_sale_payments enable row level security;
drop policy if exists tenant_isolation on fabric_sale_payments;
create policy tenant_isolation on fabric_sale_payments using (
  exists (select 1 from fabric_sales s where s.id = fabric_sale_payments.sale_id
          and s.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table fabric_stock_movements enable row level security;
drop policy if exists tenant_isolation on fabric_stock_movements;
create policy tenant_isolation on fabric_stock_movements using (
  exists (select 1 from fabrics f where f.id = fabric_stock_movements.fabric_id
          and f.business_id = current_setting('app.current_business_id', true)::uuid)
);

alter table product_stock_movements enable row level security;
drop policy if exists tenant_isolation on product_stock_movements;
create policy tenant_isolation on product_stock_movements using (
  exists (select 1 from products p where p.id = product_stock_movements.product_id
          and p.business_id = current_setting('app.current_business_id', true)::uuid)
);

-- customers, businesses, business_subscriptions, addresses, notifications,
-- and platform-wide tables (subscription_plans, product_categories,
-- service_categories, languages, translations, platform_settings) are
-- deliberately NOT tenant-RLS'd here: customers/businesses are the shared
-- marketplace identities themselves (see lib/actions/customers.ts comment),
-- and the platform-wide tables have no single owning business by design.
