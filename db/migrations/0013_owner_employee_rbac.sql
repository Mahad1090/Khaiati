-- Khaiati — Owner vs Employee distinction within one business (doc §36).
-- Run after 0012_rls_policies.sql.

alter table user_profiles add column if not exists is_owner boolean not null default false;

-- Backfill: the first-created profile per business (registration time) is
-- the owner. Best-effort for any rows created before this migration.
update user_profiles up
set is_owner = true
where up.business_id is not null
  and up.id = (
    select id from user_profiles up2
    where up2.business_id = up.business_id
    order by up2.created_at asc
    limit 1
  );
