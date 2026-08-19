-- Khaiati Management System — Phase 8: Roles & audit log
-- Run after 0004_finance.sql. Requires Supabase Auth to be enabled on this
-- project — user_profiles.id is a foreign key into Supabase's auth.users,
-- so this migration must run against the Supabase Postgres instance (not a
-- standalone Postgres) once NEXT_PUBLIC_SUPABASE_URL is configured.

create type user_role as enum (
  'administrator',
  'manager',
  'accountant',
  'storekeeper',
  'employee'
);

create table if not exists user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name varchar(150),
  role user_role not null default 'employee',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_role on user_profiles (role);

-- Row Level Security: every admin table read/write should ultimately go
-- through Supabase Auth-aware policies once the app authenticates via
-- Supabase rather than a direct DATABASE_URL connection. Enabled here so the
-- table is safe by default even before the app enforces roles at the query
-- layer (see lib/permissions.ts).
alter table user_profiles enable row level security;

create policy "Users can read their own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Administrators can read all profiles"
  on user_profiles for select
  using (
    exists (
      select 1 from user_profiles up
      where up.id = auth.uid() and up.role = 'administrator'
    )
  );

-- ---------------------------------------------------------------------------
-- audit_logs — append-only record of who changed what. Every server action
-- that mutates financial or inventory data should insert a row here once
-- authentication is wired (see lib/actions/audit.ts).
-- ---------------------------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles (id) on delete set null,
  action varchar(100) not null,       -- e.g. 'order.status_changed', 'fabric_sale.created'
  entity_type varchar(50) not null,   -- e.g. 'order', 'fabric_sale', 'worker_payment'
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_entity on audit_logs (entity_type, entity_id);
create index if not exists idx_audit_logs_user on audit_logs (user_id);
create index if not exists idx_audit_logs_created on audit_logs (created_at);
