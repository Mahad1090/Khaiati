-- Khaiati — private design catalog per business.
-- Run after 0013_owner_employee_rbac.sql.

alter table designs add column if not exists business_id uuid references businesses (id) on delete cascade;

-- Backfill existing designs to the default business so current data stays visible
-- after the catalog becomes business-scoped.
update designs
set business_id = (
  select id from businesses where slug = 'khaiati-default' limit 1
)
where business_id is null;

create index if not exists idx_designs_business on designs (business_id);
