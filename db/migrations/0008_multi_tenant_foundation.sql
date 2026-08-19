-- Khaiati — Multi-tenant marketplace foundation (marketplace doc §34, §44)
-- Run after 0007_qr_tracking.sql.
--
-- PHASE 1 of the multi-tenant rebuild: additive only. Every new business_id
-- column is NULLABLE and every new table is independent of existing data, so
-- nothing already built (the single-shop admin system) breaks when this lands.
--
-- PHASE 2 (separate, later migration + code change) will:
--   1. Create a "Khaiati" business row and backfill business_id on every
--      existing row (orders, fabrics, designs, workers, ...).
--   2. Make business_id NOT NULL once backfilled.
--   3. Rewrite every query in lib/actions/*.ts to filter by business_id
--      (from the signed-in user's session), enforced additionally via RLS.
--   4. Rename fabrics->products and designs->services in code, or keep them
--      as-is and layer product_categories/service_categories on top —
--      decide once the business registration flow exists to test against.
-- Phase 2 is not done here because rewiring ~20 action files against a
-- schema with zero real multi-business data yet is how you end up with
-- code nobody has verified against anything.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Businesses — the core tenant entity. Every business-owned row elsewhere
-- eventually points here.
-- ---------------------------------------------------------------------------
create type business_status as enum ('pending', 'approved', 'rejected', 'suspended');

create sequence if not exists business_no_seq start 1;

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  business_no varchar(20) not null unique,
  owner_user_id uuid, -- references auth.users(id) once Supabase Auth is configured
  name varchar(150) not null,
  slug varchar(160) not null unique,
  logo_path text,
  cover_image_path text,
  description text,
  location varchar(150),
  contact_phone varchar(30),
  contact_email varchar(255),
  opening_hours jsonb,
  status business_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_businesses_status on businesses (status);
create index if not exists idx_businesses_slug on businesses (slug);

create table if not exists business_settings (
  business_id uuid not null references businesses (id) on delete cascade,
  key varchar(100) not null,
  value jsonb,
  primary key (business_id, key)
);

-- ---------------------------------------------------------------------------
-- Employee roles & skills (doc §13-14)
-- ---------------------------------------------------------------------------
create type employee_role as enum (
  'master_tailor',
  'stitching_employee',
  'cutting_employee',
  'finishing_employee',
  'delivery_employee',
  'shop_assistant',
  'manager'
);

create sequence if not exists business_employee_no_seq start 1;

create table if not exists business_employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  employee_no varchar(20) not null,
  user_id uuid, -- references auth.users(id) once the employee has a login
  name varchar(150) not null,
  phone varchar(30),
  email varchar(255),
  address text,
  hiring_date date,
  role employee_role not null default 'stitching_employee',
  salary numeric(12, 2),
  payment_schedule varchar(20), -- weekly | biweekly | monthly | per_job
  status varchar(20) not null default 'active',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, employee_no)
);

create index if not exists idx_business_employees_business on business_employees (business_id);
create index if not exists idx_business_employees_role on business_employees (role);

create table if not exists employee_skills (
  employee_id uuid not null references business_employees (id) on delete cascade,
  garment_type garment_type not null,
  primary key (employee_id, garment_type)
);

-- ---------------------------------------------------------------------------
-- Global customers + per-business relationship (doc §11)
-- ---------------------------------------------------------------------------
alter table customers add column if not exists user_id uuid; -- references auth.users(id)
alter table customers add column if not exists email varchar(255);

create table if not exists business_customers (
  business_id uuid not null references businesses (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete cascade,
  notes text,
  preferences jsonb,
  created_at timestamptz not null default now(),
  primary key (business_id, customer_id)
);

-- ---------------------------------------------------------------------------
-- Reusable measurement profiles (doc §10), decoupled from any single order
-- ---------------------------------------------------------------------------
create table if not exists measurement_profiles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  profile_name varchar(100) not null default 'Default',
  garment_type garment_type not null,
  height numeric(6, 2),
  sleeve numeric(6, 2),
  shoulder numeric(6, 2),
  neck numeric(6, 2),
  armhole numeric(6, 2),
  armpit numeric(6, 2),
  chest numeric(6, 2),
  waist numeric(6, 2),
  hip numeric(6, 2),
  inseam numeric(6, 2),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_measurement_profiles_customer on measurement_profiles (customer_id);

-- order_items gain an optional link to the profile used, so the order still
-- shows a frozen snapshot (existing garment_measurements table) even if the
-- customer edits or deletes the profile afterward.
alter table order_items add column if not exists measurement_profile_id uuid
  references measurement_profiles (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Product / service catalogue (doc §7-8, §19-20)
-- ---------------------------------------------------------------------------
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  slug varchar(120) not null unique
);

create table if not exists service_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  slug varchar(120) not null unique
);

create sequence if not exists product_no_seq start 1;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  product_no varchar(20) not null,
  category_id uuid references product_categories (id) on delete set null,
  name varchar(150) not null,
  description text,
  images jsonb, -- array of storage paths, served via CDN proxy
  fabric_type varchar(100),
  color varchar(50),
  sizes jsonb,
  price numeric(12, 2) not null default 0 check (price >= 0),
  stock_quantity numeric(10, 2) not null default 0 check (stock_quantity >= 0),
  is_available boolean not null default true,
  status varchar(20) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, product_no)
);

create index if not exists idx_products_business on products (business_id);
create index if not exists idx_products_category on products (category_id);

create table if not exists product_stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  movement_type stock_movement_type not null,
  quantity numeric(10, 2) not null,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create sequence if not exists service_no_seq start 1;

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  service_no varchar(20) not null,
  category_id uuid references service_categories (id) on delete set null,
  name varchar(150) not null,
  description text,
  clothing_category garment_type,
  price numeric(12, 2) not null default 0 check (price >= 0),
  estimated_completion_days integer,
  required_measurement_fields jsonb, -- subset of measurement field keys this service needs
  is_available boolean not null default true,
  status varchar(20) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, service_no)
);

create index if not exists idx_services_business on services (business_id);

-- ---------------------------------------------------------------------------
-- Orders gain tenant + marketplace fields (doc §9, §17-18, §26-28)
-- ---------------------------------------------------------------------------
create type order_kind as enum ('product', 'stitching', 'product_and_stitching');
create type delivery_option as enum ('pickup', 'delivery');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');

alter table orders add column if not exists business_id uuid references businesses (id) on delete restrict;
alter table orders add column if not exists order_kind order_kind not null default 'stitching';
alter table orders add column if not exists delivery_option delivery_option not null default 'pickup';
alter table orders add column if not exists delivery_address_id uuid; -- references addresses(id), added below

create index if not exists idx_orders_business on orders (business_id);

alter table order_items add column if not exists product_id uuid references products (id) on delete set null;
alter table order_items add column if not exists service_id uuid references services (id) on delete set null;

alter table order_payments add column if not exists status payment_status not null default 'paid';
alter table order_payments add column if not exists transaction_id varchar(100);

-- ---------------------------------------------------------------------------
-- Order-time measurement snapshot (doc §18), separate from the reusable
-- profile so later profile edits never rewrite what a past order actually used.
-- ---------------------------------------------------------------------------
create table if not exists order_measurements (
  order_item_id uuid primary key references order_items (id) on delete cascade,
  measurement_profile_id uuid references measurement_profiles (id) on delete set null,
  snapshot jsonb not null, -- frozen copy of the measurement fields at order time
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Addresses (doc §27)
-- ---------------------------------------------------------------------------
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  label varchar(50),
  line1 varchar(200) not null,
  line2 varchar(200),
  city varchar(100),
  state varchar(100),
  postal_code varchar(20),
  country varchar(100),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_customer on addresses (customer_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_orders_delivery_address'
  ) then
    alter table orders add constraint fk_orders_delivery_address
      foreign key (delivery_address_id) references addresses (id) on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Subscriptions & platform billing (doc §29-30)
-- ---------------------------------------------------------------------------
create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  price numeric(12, 2) not null default 0,
  duration_days integer not null default 30,
  commission_rate numeric(5, 2) not null default 0, -- percent, if hybrid model
  features jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  plan_id uuid not null references subscription_plans (id) on delete restrict,
  start_date date not null default current_date,
  expiry_date date,
  payment_status payment_status not null default 'pending',
  renewal_date date,
  created_at timestamptz not null default now()
);

create index if not exists idx_business_subscriptions_business on business_subscriptions (business_id);

-- ---------------------------------------------------------------------------
-- Reviews (doc §22)
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  status varchar(20) not null default 'published', -- published | hidden (admin moderation)
  created_at timestamptz not null default now(),
  unique (order_id) -- one review per completed order
);

create index if not exists idx_reviews_business on reviews (business_id);

-- ---------------------------------------------------------------------------
-- Notifications (doc §37)
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- references auth.users(id)
  type varchar(50) not null,
  title varchar(200) not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications (user_id, read_at);

-- ---------------------------------------------------------------------------
-- Platform settings + languages/translations (doc §38-40)
-- ---------------------------------------------------------------------------
create table if not exists platform_settings (
  key varchar(100) primary key,
  value jsonb
);

create table if not exists languages (
  code varchar(5) primary key, -- 'en' | 'fa'
  name varchar(50) not null,
  direction varchar(3) not null default 'ltr' check (direction in ('ltr', 'rtl'))
);

insert into languages (code, name, direction) values
  ('en', 'English', 'ltr'),
  ('fa', 'Persian / Farsi', 'rtl')
on conflict (code) do nothing;

create table if not exists translations (
  namespace varchar(50) not null,
  key varchar(100) not null,
  language_code varchar(5) not null references languages (code),
  value text not null,
  primary key (namespace, key, language_code)
);

-- updated_at triggers for the new mutable tables
do $$
declare
  t text;
begin
  foreach t in array array['businesses', 'business_employees', 'products', 'services']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on %I; create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end $$;
