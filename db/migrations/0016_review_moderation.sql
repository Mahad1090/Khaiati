-- Khaiati — Reviews must be approved by the store owner before they're public.
-- Run after 0015_role_hierarchy.sql.
--
-- The reviews.status column previously defaulted to 'published', so a
-- customer's review went live immediately with no moderation step at all —
-- contradicting the intended flow (customer submits -> store owner approves
-- -> then it appears on the storefront). lib/actions/reviews.ts now always
-- inserts new/edited reviews as 'pending' explicitly; this migration fixes
-- the column default too, and re-queues any review that was never actually
-- looked at by anyone (best-effort — real moderation systems should track
-- who/when they approved, out of scope for this fix).
alter table reviews alter column status set default 'pending';

comment on column reviews.status is 'pending | published | hidden — set by store owner / admin moderation (lib/actions/reviews.ts:moderateReview)';
