-- Khaiati — small addition to businesses for the registration form (doc §32).
-- Run after 0008_multi_tenant_foundation.sql.

alter table businesses add column if not exists owner_name varchar(150);
