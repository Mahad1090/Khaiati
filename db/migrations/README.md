# Migrations

Run these against PostgreSQL **in order**. Each file is meant to run once, on a fresh or already-migrated database — none of them are idempotent re-runs (matches how `CREATE TYPE` works in Postgres; there's no `IF NOT EXISTS` for enum types).

```
psql "$DATABASE_URL" -f db/migrations/0001_core.sql
psql "$DATABASE_URL" -f db/migrations/0002_workers.sql
... through 0013 ...
```

| File | What it adds |
|---|---|
| `0001_core.sql` | Customers, designs, orders, order items, garment measurements, order payments |
| `0002_workers.sql` | Workers, work assignments, salary/wage payments, advances |
| `0003_fabrics.sql` | Fabrics, suppliers, purchases, purchase payments, sales, sale payments, stock movements |
| `0004_finance.sql` | Manual income/expense entries (sewing income, fabric-sales income, and worker/fabric expenses are derived live from the tables above, not duplicated here) |
| `0005_auth.sql` | `user_profiles` + role enum, `audit_logs` — requires Supabase Auth (`auth.users`) to exist, so run this against the Supabase Postgres instance once that's configured |
| `0006_public_site.sql` | `contact_inquiries`, `newsletter_subscribers` — backs the public homepage's lead-capture forms |
| `0007_qr_tracking.sql` | Adds `orders.tracking_token` — backs the public `/track/[token]` QR page |
| `0008_multi_tenant_foundation.sql` | **Marketplace pivot, Phase 1 (schema only).** Adds `businesses`, `business_employees`, `products`, `services`, `measurement_profiles`, `addresses`, `subscription_plans`, `reviews`, `notifications`, `platform_settings`, `languages`/`translations`, and tenant (`business_id`) columns on existing tables. Everything is additive and nullable — the single-shop admin system built in 0001-0007 keeps working unmodified. |
| `0009_business_owner_contact.sql` | Adds `businesses.owner_name` — backs the public business registration form |
| `0010_tenant_backfill.sql` | **Phase 2 step 1.** Creates a default "Khaiati" business, backfills it onto every existing order, makes `orders.business_id` required, and adds `user_profiles.business_id` (links staff to the business they work for). `lib/actions/orders.ts` and `customers.ts` are now tenant-scoped through `lib/auth/business-context.ts`. |
| `0011_tenant_scope_workers_fabrics_finance.sql` | **Phase 2 step 2.** Adds required `business_id` to `workers`, `fabric_suppliers`, `fabrics`, `fabric_purchases`, `fabric_sales`, `income`, `expenses` (backfilled to the default business). `lib/actions/workers.ts`, `fabrics.ts`, `suppliers.ts`, `fabric-transactions.ts`, `finance.ts`, and `reports.ts` are now tenant-scoped. |
| `0012_rls_policies.sql` | Row Level Security policies on every tenant table, keyed on `app.current_business_id`. **Not active** until the DB role and call sites change — see the migration's header comment and item 6 below. |
| `0013_owner_employee_rbac.sql` | Adds `user_profiles.is_owner`. Backs the Owner vs. Employee distinction within one business — see item 16 below. |

## Current architectural state

1. **`businesses` is load-bearing** — real registration (`/register-business`) and platform-admin approval (`/admin/businesses`) read and write it.
2. **Tenant-scoped** (0010-0011): `orders`, `customers` (relationship/history, not identity), `workers`, `fabrics`, `fabric_suppliers`, `fabric_purchases`, `fabric_sales`, `income`, `expenses` — every read/write in `lib/actions/{orders,customers,dashboard,workers,fabrics,suppliers,fabric-transactions,finance,reports}.ts` now filters through `getCurrentBusinessId()` (`lib/auth/business-context.ts`). Falls back to the single default "Khaiati" business until real business-staff accounts exist, so nothing already built broke.
3. **Not yet tenant-scoped**: `designs` (should become `services`), and the newer marketplace tables from 0008 (`products`, `measurement_profiles`, `addresses`, `reviews`, `notifications`) have `business_id`/ownership columns in the schema but no application code reads or writes them yet.
4. **Business-owner login exists**: `/register-business` creates the owner's Supabase Auth account (email/password) alongside the `pending` business row and links it via `user_profiles.business_id`. Signing in at `/admin/login` takes them to the *same* `/admin/*` pages already built — because those were already tenant-scoped in steps 2-3, a business owner automatically sees only their own data with zero extra code. `AdminShell` hides platform-only nav (Businesses approval, Users, Settings) for business staff, and blocks the dashboard behind a "pending review" / "not approved" / "suspended" screen until their business is `approved`.
5. **Self-service**: `/admin/business-profile` — a business can edit its own storefront info (name, contact, location, description). Always scoped to the signed-in user's own business, never a caller-supplied id.
6. **Row Level Security** (`0012_rls_policies.sql`) — policies exist on every tenant table, keyed on the `app.current_business_id` session variable. **Read the migration's header comment before assuming this is active**: it only has teeth once `DATABASE_URL` connects as a non-superuser role without `BYPASSRLS`, and callers use the new `queryScoped()`/`withTenantTransaction()` helpers in `lib/db.ts` instead of plain `query()`/`withTransaction()`. The existing `lib/actions/*.ts` files have NOT been migrated to the scoped helpers yet — today's real enforcement is still the application-layer `WHERE business_id = ...` clauses; RLS is the infrastructure for the next hardening pass, not yet the active guard.
7. **Subscriptions** (doc §29-30): `subscription_plans` (platform admin creates/manages at `/admin/subscription-plans`) and `business_subscriptions` (a business requests a plan at `/admin/subscription`, platform admin manually confirms payment — there is no payment gateway integration; that requires a real provider account and credentials this project doesn't have, so payment confirmation is an honest manual step rather than a faked checkout).
8. **Customer accounts** (`/account/register`, `/account/login`, `/account`) — real Supabase-backed signup, order history across every business, review submission, QR-tracking links per order.
9. **Products & Services marketplace listings** (`/admin/products`, `/admin/services`) — business-managed, publicly visible on their storefront.
10. **Public discovery** (`/businesses`, `/business/[slug]`) — real approved-business search (homepage search bar and Featured Businesses now query real data, no more hardcoded examples), storefront pages with live products/services/reviews.
11. **Customer-initiated ordering** — a customer can request a service or product directly from a storefront; creates a real order (status `new_order`, correct `order_kind`), decrements product stock atomically. Deliberately simplified from a full multi-item cart: one request at a time, measurements taken by the business afterward rather than collected on the public form (see code comment in `lib/actions/customer-orders.ts`).
12. **`order_kind`/`delivery_option`** now exposed in both the staff order form and customer requests, not just sitting unused in the schema.
13. **Reviews** (`/admin/reviews`, storefront pages, `/account`) — customers review completed orders, businesses see their own, platform admin moderates (publish/hide).
14. **Notifications** — real events (business approved/rejected/suspended, order status changed) create rows a bell icon surfaces in both the public and admin headers.
15. **Platform-wide admin dashboard** — `/admin` now shows real cross-business totals (businesses, customers, orders, platform revenue, subscriptions) for a platform admin, instead of silently showing the default business's numbers.
16. **Owner vs. Employee RBAC within one business** (`0013_owner_employee_rbac.sql`, `/admin/team`) — the business owner (set at registration) can invite additional dashboard-access team members; employees can't see Finance, edit the Business Profile, or manage the Subscription — enforced both in the sidebar and server-side via `requireOwner()` in `lib/auth/business-context.ts`.

**Still not built, and not attempted** — genuinely separate, larger undertakings: a real payment gateway (needs an actual provider account/credentials this project doesn't have — building a fake one would be worse than not building it), a QR-*scan*-driven employee status-update flow (the QR *read-only tracking* page is built; a mobile scan-to-update-status flow for employees is separate and needs its own auth/UI), full site-wide i18n/RTL (the EN/فارسی toggle covers the header+hero only), and merging the legacy `workers` (shop-floor tailors/cutters) model with the newer `business_employees` schema table — both exist in parallel; unifying them risks breaking the working Workers module for a purely structural cleanup with no user-facing gap today.
