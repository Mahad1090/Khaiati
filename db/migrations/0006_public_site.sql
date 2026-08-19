-- Khaiati Management System — public-site inbound leads
-- Backs the "Book a Fitting" / "Enquire" / "Newsletter" actions on the
-- marketing homepage with real storage, instead of dead buttons.
-- Run after 0005_auth.sql.

create table if not exists contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  phone varchar(30) not null,
  garment_type garment_type,
  message text,
  status varchar(20) not null default 'new', -- new | contacted | closed
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_inquiries_status on contact_inquiries (status);
create index if not exists idx_contact_inquiries_created on contact_inquiries (created_at);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  created_at timestamptz not null default now()
);
