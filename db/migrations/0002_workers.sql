-- Khaiati Management System — Phase 4: Worker management
-- Adds: workers, worker_assignments (linked to orders), worker_payments,
-- worker_advances. Run after 0001_core.sql.

create sequence if not exists worker_no_seq start 1;

create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  worker_no varchar(20) not null unique,      -- serial, e.g. W-0001
  name varchar(150) not null,
  occupation varchar(100),
  contact_number varchar(30),
  employee_number varchar(50),
  salary numeric(12, 2),                      -- base salary, if salaried
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workers_name on workers (lower(name));
create index if not exists idx_workers_contact on workers (contact_number);
create index if not exists idx_workers_employee_no on workers (employee_number);

-- ---------------------------------------------------------------------------
-- worker_assignments — work assigned to a worker, linked to an order so a
-- garment's production stage is traceable back to who is doing it.
-- ---------------------------------------------------------------------------
create type work_type as enum ('scissors', 'sewing', 'correction', 'other');
create type assignment_status as enum ('assigned', 'in_progress', 'completed', 'canceled');

create table if not exists worker_assignments (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references workers (id) on delete restrict,
  order_id uuid references orders (id) on delete set null,
  order_item_id uuid references order_items (id) on delete set null,
  garment_type garment_type not null,
  work_type work_type not null,
  quantity integer not null default 1 check (quantity > 0),
  submitted_date date not null default current_date,
  due_date date,
  status assignment_status not null default 'assigned',
  wage numeric(12, 2) not null default 0 check (wage >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assignments_worker on worker_assignments (worker_id);
create index if not exists idx_assignments_order on worker_assignments (order_id);
create index if not exists idx_assignments_status on worker_assignments (status);

-- ---------------------------------------------------------------------------
-- worker_payments — salary / wage payouts. period columns support weekly,
-- biweekly, monthly, or one-off per-job payment models.
-- ---------------------------------------------------------------------------
create type pay_model as enum ('weekly', 'biweekly', 'monthly', 'per_job');

create table if not exists worker_payments (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references workers (id) on delete cascade,
  pay_model pay_model not null default 'per_job',
  amount numeric(12, 2) not null check (amount > 0),
  period_start date,
  period_end date,
  paid_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_worker_payments_worker on worker_payments (worker_id);

-- ---------------------------------------------------------------------------
-- worker_advances — advance salary against future earnings
-- ---------------------------------------------------------------------------
create table if not exists worker_advances (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references workers (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  advance_date date not null default current_date,
  salary_period varchar(50),
  reason text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_worker_advances_worker on worker_advances (worker_id);

do $$
declare
  t text;
begin
  foreach t in array array['workers', 'worker_assignments']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on %I; create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end $$;
