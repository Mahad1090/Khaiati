-- Khaiati Management System — Phase 6: Income, expenses, profit & loss
-- Run after 0003_fabrics.sql.
--
-- Design note: sewing income, fabric-sales income, worker salary/wage/advance
-- expense, and fabric-purchase expense are NOT duplicated here — they are
-- derived directly from order_payments, fabric_sale_payments, worker_payments,
-- worker_advances, and fabric_purchase_payments in the profit & loss report,
-- so there is exactly one source of truth per transaction (see lib/actions/finance.ts).
-- These two tables only hold manual entries for categories with no other
-- transactional home: "other income", and shop-level expenses (rent,
-- electricity, transportation, company payments, other).

create sequence if not exists income_no_seq start 1;
create sequence if not exists expense_no_seq start 1;

create type income_category as enum ('other');

create table if not exists income (
  id uuid primary key default gen_random_uuid(),
  income_no varchar(20) not null unique,
  category income_category not null default 'other',
  amount numeric(12, 2) not null check (amount > 0),
  income_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_income_date on income (income_date);

create type expense_category as enum (
  'company_payment',
  'shop',
  'electricity',
  'rent',
  'transportation',
  'other'
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  expense_no varchar(20) not null unique,
  category expense_category not null default 'other',
  amount numeric(12, 2) not null check (amount > 0),
  expense_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_date on expenses (expense_date);
create index if not exists idx_expenses_category on expenses (category);
