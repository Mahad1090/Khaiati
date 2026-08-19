-- Khaiati Management System — Phase 1 core schema
-- Covers: customers, garments/measurements, designs, orders, order financials.
-- Later phases add: workers, fabrics/suppliers, income/expenses, audit_logs.
--
-- Conventions:
--   * All money columns are NUMERIC(12,2) — never floating point.
--   * Every table has created_at/updated_at timestamps.
--   * Soft "active" flags are used instead of deletes where history matters.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create sequence if not exists customer_no_seq start 1;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  customer_no varchar(20) not null unique, -- human-facing serial, e.g. C-0001
  name varchar(150) not null,
  phone varchar(30) not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customers_phone on customers (phone);
create index if not exists idx_customers_name on customers (lower(name));
-- Prevent accidental duplicate registration: same phone number twice.
create unique index if not exists uq_customers_phone on customers (phone);

-- ---------------------------------------------------------------------------
-- designs — reusable design catalogue, selectable during order creation
-- ---------------------------------------------------------------------------
create type garment_type as enum ('shirt', 'vest', 'coat', 'pants', 'jacket');

create table if not exists designs (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  garment_type garment_type not null,
  description text,
  image_path text, -- storage key, served via CDN proxy — not a public URL
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_designs_garment_type on designs (garment_type);
create index if not exists idx_designs_active on designs (is_active);

-- ---------------------------------------------------------------------------
-- orders — one order can contain multiple garment items
-- ---------------------------------------------------------------------------
create type order_status as enum (
  'new_order',
  'measurements_taken',
  'submitted_to_scissors',
  'submitted_to_sewing',
  'in_process',
  'completed',
  'delivered',
  'canceled'
);

create sequence if not exists order_no_seq start 1;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no varchar(20) not null unique, -- e.g. KHA-2026-000123
  customer_id uuid not null references customers (id) on delete restrict,
  status order_status not null default 'new_order',
  order_date date not null default current_date,
  due_date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_customer on orders (customer_id);
create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_due_date on orders (due_date);

-- ---------------------------------------------------------------------------
-- order_items — one line per garment within an order
-- ---------------------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  garment_type garment_type not null,
  design_id uuid references designs (id) on delete set null,
  quantity integer not null check (quantity > 0),
  price_per_piece numeric(12, 2) not null check (price_per_piece >= 0),
  -- total_price is derived (quantity * price_per_piece) but stored so history
  -- is never silently recalculated if pricing logic changes later.
  total_price numeric(12, 2) not null check (total_price >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on order_items (order_id);
create index if not exists idx_order_items_design on order_items (design_id);

-- ---------------------------------------------------------------------------
-- garment_measurements — one set per order_item, so history is never
-- overwritten by a later order for the same customer.
-- Columns cover the union of all garment-type fields; forms only show the
-- subset relevant to the item's garment_type.
-- ---------------------------------------------------------------------------
create table if not exists garment_measurements (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null unique references order_items (id) on delete cascade,
  height numeric(6, 2),
  sleeve numeric(6, 2),
  shoulder numeric(6, 2),
  neck numeric(6, 2),
  armhole numeric(6, 2),   -- shirt "armhole"
  armpit numeric(6, 2),    -- vest / coat / trousers "armpit"
  chest numeric(6, 2),
  waist numeric(6, 2),
  hip numeric(6, 2),
  inseam numeric(6, 2),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- order_payments — every payment against an order; balance is derived from
-- sum(payments), never stored redundantly on the order itself.
-- ---------------------------------------------------------------------------
create table if not exists order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  paid_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_payments_order on order_payments (order_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper, reused by every table above and future ones
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array['customers', 'designs', 'orders', 'order_items', 'garment_measurements']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on %I; create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end $$;
