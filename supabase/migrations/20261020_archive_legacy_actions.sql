-- Retire the pre-import action catalog: `actions`, `checklistactions`,
-- `interventionchecklistactions`.
--
-- Nothing in the app reads or writes them since 2026-09-16 — actions are per-check-list
-- imported data (`cl_action`, Action#04) and intervention results live in `int_result`
-- (20260831_intervention_lifecycle.sql).
--
-- MOVED, NOT DROPPED. `interventionchecklistactions` still holds pre-rework intervention
-- results with no mapping onto `cl_action`; moving the tables to an `archive` schema takes
-- them out of the API (PostgREST only exposes `public`) without losing those rows.
-- To undo: `alter table archive.<name> set schema public;`
-- To drop for good later: `drop schema archive cascade;`
--
-- Apply AFTER 20260831_intervention_lifecycle.sql. Order matters only for readability —
-- the foreign keys between the three move with them.

create schema if not exists archive;

alter table if exists public.interventionchecklistactions set schema archive;
alter table if exists public.checklistactions set schema archive;
alter table if exists public.actions set schema archive;
