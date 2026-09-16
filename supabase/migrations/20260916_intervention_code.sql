-- FIREPUMP25 — assign INTERVENTION.Code on insert
--
-- 20260831_intervention_lifecycle.sql added `code` (the spec's Report Nr.), backfilled the
-- existing rows to `id` and put a unique constraint on it — but nothing assigns it on
-- insert. A unique index permits unlimited NULLs, so the omission is silent: every
-- intervention created since has code = NULL. Verified on intervention 12, 2026-09-16.
--
-- Why a trigger and not the write path
-- -----------------------------------
-- `addIntervention` runs in the browser, so a client-side `max(code) + 1` races: two
-- technicians saving at once compute the same number and the second insert fails on the
-- unique constraint. The check-list import dodges this by assigning server-side
-- (app/api/checklists/import/route.ts), but an intervention has no route to hang that on.
--
-- `id` is already a gap-free-enough identity sequence and the backfill made code = id for
-- every existing row, so continuing that is both race-free and consistent with the data
-- already there. A BEFORE INSERT trigger sees the identity value in NEW.id, so it can copy
-- it without a second statement.
--
-- `coalesce` rather than an unconditional assignment: if a caller ever supplies its own
-- Report Nr. (an import of historical interventions, say), the trigger leaves it alone.

begin;

create or replace function public.set_intervention_code()
returns trigger
language plpgsql
as $$
begin
  new.code := coalesce(new.code, new.id);
  return new;
end;
$$;

drop trigger if exists interventions_set_code on public.interventions;
create trigger interventions_set_code
  before insert on public.interventions
  for each row
  execute function public.set_intervention_code();

-- Any rows created between the lifecycle migration and this one.
update public.interventions set code = id where code is null;

commit;
