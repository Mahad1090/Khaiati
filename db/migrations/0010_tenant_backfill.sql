-- Khaiati — Phase 2 step 1: backfill a default business and make orders
-- tenant-required. Run after 0009_business_owner_contact.sql.
--
-- Every order created before multi-tenancy existed gets assigned to this one
-- "Khaiati" business (approved, so it behaves identically to how the system
-- worked before this migration). New orders going forward always require a
-- real business_id — see getCurrentBusinessId() in lib/auth/business-context.ts.

insert into businesses (business_no, name, slug, owner_name, contact_email, status)
select 'B-' || lpad(nextval('business_no_seq')::text, 4, '0'),
       'Khaiati', 'khaiati-default', 'Khaiati', 'staff@khaiati.local', 'approved'
where not exists (select 1 from businesses where slug = 'khaiati-default');

update orders
set business_id = (select id from businesses where slug = 'khaiati-default')
where business_id is null;

alter table orders alter column business_id set not null;

-- Links staff to the business they work for. Null = not yet assigned
-- (falls back to the default business — see getCurrentBusinessId()).
alter table user_profiles add column if not exists business_id uuid references businesses (id) on delete set null;
