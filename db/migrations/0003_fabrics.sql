-- Khaiati Management System — Phase 5: Fabric store management
-- Adds: fabric_suppliers, fabrics, fabric_purchases, fabric_purchase_payments,
-- fabric_sales, fabric_stock_movements. Run after 0002_workers.sql.

create sequence if not exists supplier_no_seq start 1;
create sequence if not exists fabric_no_seq start 1;
create sequence if not exists purchase_no_seq start 1;
create sequence if not exists sale_no_seq start 1;

-- ---------------------------------------------------------------------------
-- fabric_suppliers — fabric companies
-- ---------------------------------------------------------------------------
create table if not exists fabric_suppliers (
  id uuid primary key default gen_random_uuid(),
  supplier_no varchar(20) not null unique,     -- serial, e.g. S-0001
  company_name varchar(150) not null,
  contact_person varchar(150),
  phone varchar(30),
  address text,
  company_number varchar(50),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_suppliers_company on fabric_suppliers (lower(company_name));
create index if not exists idx_suppliers_phone on fabric_suppliers (phone);

-- ---------------------------------------------------------------------------
-- fabrics — catalogue entry. Available stock is derived from
-- fabric_stock_movements, never stored redundantly here.
-- ---------------------------------------------------------------------------
create table if not exists fabrics (
  id uuid primary key default gen_random_uuid(),
  fabric_no varchar(20) not null unique,       -- serial, e.g. F-0001
  name varchar(150) not null,
  fabric_type varchar(100),
  supplier_id uuid references fabric_suppliers (id) on delete set null,
  color varchar(50),
  price_per_meter numeric(12, 2) not null default 0 check (price_per_meter >= 0),
  selling_price numeric(12, 2) not null default 0 check (selling_price >= 0),
  unit varchar(20) not null default 'meter',
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fabrics_name on fabrics (lower(name));
create index if not exists idx_fabrics_supplier on fabrics (supplier_id);
create index if not exists idx_fabrics_color on fabrics (color);

-- ---------------------------------------------------------------------------
-- fabric_purchases — one purchase = one company bill. Total = price_per_meter
-- * size_meters. If amount_paid < total, it is a running supplier debt;
-- fabric_purchase_payments records installments against it.
-- ---------------------------------------------------------------------------
create type payment_type as enum ('cash', 'bank_transfer', 'credit', 'other');

create table if not exists fabric_purchases (
  id uuid primary key default gen_random_uuid(),
  purchase_no varchar(20) not null unique,
  fabric_id uuid not null references fabrics (id) on delete restrict,
  supplier_id uuid not null references fabric_suppliers (id) on delete restrict,
  company_bill_number varchar(50),
  price_per_meter numeric(12, 2) not null check (price_per_meter >= 0),
  size_meters numeric(10, 2) not null check (size_meters > 0),
  total_price numeric(12, 2) not null check (total_price >= 0),
  color varchar(50),
  sale_price numeric(12, 2) not null default 0 check (sale_price >= 0),
  total_sale_price numeric(12, 2) not null default 0 check (total_sale_price >= 0),
  purchase_date date not null default current_date,
  payment_type payment_type not null default 'cash',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_purchases_fabric on fabric_purchases (fabric_id);
create index if not exists idx_purchases_supplier on fabric_purchases (supplier_id);
create index if not exists idx_purchases_bill on fabric_purchases (company_bill_number);

-- Installments against a purchase's outstanding balance (the "loan").
create table if not exists fabric_purchase_payments (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references fabric_purchases (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  paid_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_purchase_payments_purchase on fabric_purchase_payments (purchase_id);

-- ---------------------------------------------------------------------------
-- fabric_sales — reduces available stock via a paired stock movement.
-- ---------------------------------------------------------------------------
create table if not exists fabric_sales (
  id uuid primary key default gen_random_uuid(),
  sale_no varchar(20) not null unique,
  fabric_id uuid not null references fabrics (id) on delete restrict,
  customer_id uuid references customers (id) on delete set null,
  color varchar(50),
  size_meters numeric(10, 2) not null check (size_meters > 0),
  price_per_meter numeric(12, 2) not null check (price_per_meter >= 0),
  total_price numeric(12, 2) not null check (total_price >= 0),
  sale_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_fabric on fabric_sales (fabric_id);
create index if not exists idx_sales_customer on fabric_sales (customer_id);

create table if not exists fabric_sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references fabric_sales (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  paid_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sale_payments_sale on fabric_sale_payments (sale_id);

-- ---------------------------------------------------------------------------
-- fabric_stock_movements — every stock change is traceable; available stock
-- for a fabric is sum(quantity_meters) over this table, never overwritten.
-- ---------------------------------------------------------------------------
create type stock_movement_type as enum ('purchase', 'sale', 'adjustment');

create table if not exists fabric_stock_movements (
  id uuid primary key default gen_random_uuid(),
  fabric_id uuid not null references fabrics (id) on delete cascade,
  movement_type stock_movement_type not null,
  quantity_meters numeric(10, 2) not null, -- positive = stock in, negative = stock out
  reference_id uuid, -- fabric_purchases.id or fabric_sales.id, loosely linked
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_stock_movements_fabric on fabric_stock_movements (fabric_id);
create index if not exists idx_stock_movements_type on fabric_stock_movements (movement_type);

do $$
declare
  t text;
begin
  foreach t in array array['fabric_suppliers', 'fabrics', 'fabric_purchases']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on %I; create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end $$;
