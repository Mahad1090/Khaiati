-- Khaiati — QR-code order progress tracking (marketplace doc section 25,
-- called out as the headline "Updated Requirement").
-- Run after 0006_public_site.sql.

alter table orders add column if not exists tracking_token uuid not null default gen_random_uuid();
create unique index if not exists uq_orders_tracking_token on orders (tracking_token);

-- The tracking token is intentionally separate from the internal orders.id —
-- it's the only identifier ever exposed on the public /track/[token] page,
-- and that page must never expose customer name, phone, pricing, or payment
-- details (per the doc's explicit security note on the QR feature).
