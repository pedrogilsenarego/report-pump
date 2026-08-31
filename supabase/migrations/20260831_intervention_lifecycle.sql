-- FIREPUMP25 — Intervention lifecycle
-- (INTERVENTION field set + INT_RESULT / INT_NOTES / MEASUREMENTS / TECHNICIAN_INT + CTRL_STATUS)
--
-- Spec: docs/data-model.md (tables), docs/screens-flows.md (Screen#09 REPORTS block —
-- Create New / Finalise existing / View existing / Print Blank / Print (PDF)),
-- docs/reports-outputs.md (what the reports read back).
--
-- Why this migration exists
-- -------------------------
-- 20260812_cl_checklist_tree.sql landed the check-list TEMPLATE (cl_gr -> cl_sub_gr ->
-- cl_action -> cl_action_values). Nothing records what a technician ANSWERS against it.
-- The intervention path still reads the pre-import `checklistactions` -> `actions` tables,
-- so a check-list imported by Action#04 has cl_action rows and NO checklistactions rows —
-- its actions do not appear in New Intervention or on the report at all. This migration is
-- the storage half of fixing that; the read/write path is repointed in the same change.
--
-- Design decisions (flagged because they diverge from the spec's literal shape)
-- ---------------------------------------------------------------------------
--  * RESULT ROWS CARRY BOTH A FK AND A CODE SNAPSHOT. int_result and measurements point at
--    cl_action / cl_action_values by surrogate id (ON DELETE SET NULL) *and* store the
--    spec's composite codes (checklist_id, code_gr, code_sub_gr, code_action). This is the
--    open re-import question (Q3 in checklist-actions-import.md) made harmless: if a
--    re-import drops an action, a completed intervention keeps a readable, printable answer
--    instead of orphaning or cascading away. Recorded field data must outlive the template.
--
--  * TECHNICIAN_INT1 / TECHNICIAN_INT2 COLLAPSE INTO ONE TABLE WITH A `slot` COLUMN.
--    The spec draws two tables with identical field lists and never says why
--    (data-model.md marks it [?]). One table + `slot in (1,2)` is the same data with half
--    the code. If the client comes back with a real distinction, splitting is a view away.
--
--  * `locked` IS boolean, NOT the spec's I(1) 1/2. Every other Condition-style field in the
--    spec keeps its integer domain because the values are loaded from spreadsheets and
--    displayed; `Locked` is neither — it is a pure internal gate ("Locked = 2" -> printable).
--    Stored as boolean, mapped to 1/2 only if a report ever has to print it.
--
--  * `result` IS THE SPEC'S CHAR DOMAIN 'V'/'X'/'-', not the UI's ok/error/ne strings.
--    p3: V = Ok, X = Fail, - = See notes. Sheet 5/6 also uses an undocumented fourth value
--    '*' (see docs/spec-inputs.md Q8), so the CHECK allows it rather than rejecting data we
--    were told to expect. UI labels map at the boundary, as they already do.
--
--  * EXISTING `interventionchecklistactions` ROWS ARE NOT MIGRATED AND NOT DROPPED.
--    They reference `checklistactions` -> `actions`, the pre-import catalog, and there is no
--    reliable mapping from those onto cl_action (the codes are per-check-list and the old
--    catalog is global). Legacy rows stay readable where they are; new work writes int_result.
--    Dropping the old tables is a separate, deliberate step once nothing reads them.
--
-- There is no Supabase CLI linked to this project — run this in the SQL editor.

begin;

-- ---------------------------------------------------------------------------
-- 0. Helper: add a column whose type is copied from the column it references.
--
--    `checklists.id`, `interventions.id`, `cl_action.id` and `cl_action_values.id` are all
--    known bigint (20260812 declares them, and is applied). `pumps.id` and `profiles.id`
--    are NOT verifiable from the repo — the TS types call them `string`, which in this
--    codebase covers both uuid and a bigint that arrived as a string, and no migration in
--    the repo creates either table. Rather than guess a type and have the FK fail, these
--    two columns copy whatever the target actually is.
--
--    pg_temp is session-local, so this disappears on its own when the SQL editor tab ends.
-- ---------------------------------------------------------------------------
create or replace function pg_temp.add_ref_column(
  p_table      text,
  p_column     text,
  p_ref_table  text,
  p_ref_column text,
  p_on_delete  text default 'no action'
) returns void
language plpgsql
as $fn$
declare
  ref_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into ref_type
    from pg_attribute a
   where a.attrelid = ('public.' || p_ref_table)::regclass
     and a.attname  = p_ref_column
     and a.attnum   > 0
     and not a.attisdropped;

  if ref_type is null then
    raise exception 'public.%.% does not exist — cannot type %.%',
      p_ref_table, p_ref_column, p_table, p_column;
  end if;

  if exists (
    select 1 from pg_attribute
     where attrelid = ('public.' || p_table)::regclass
       and attname  = p_column
       and attnum   > 0
       and not attisdropped
  ) then
    return;  -- already added by an earlier run
  end if;

  execute format(
    'alter table public.%I add column %I %s references public.%I (%I) on delete %s',
    p_table, p_column, ref_type, p_ref_table, p_ref_column, p_on_delete
  );
end;
$fn$;

-- ---------------------------------------------------------------------------
-- 1. CTRL_STATUS — INTERVENTION.Controler_Status lookup.
--
--    data-model.md lists this as loaded by Action#04 from Table_Ctrl_Status.xlsx, but
--    Action#04's own pseudocode only fills the four _TEXT tables, and the import route
--    only accepts the four Form files. It is three fixed rows, so it is seeded here and
--    can be repointed at an upload later without a data migration.
--
--    KEY CONFLICT (docs/spec-inputs.md): the xlsx keys these 1/2/3 while p3's pre-set table
--    gives INTERVENTION.Controler_Status as A/M/0. The xlsx is the artifact that actually
--    gets loaded, so it wins here. `code` is text so that switching to A/M/0 is an UPDATE,
--    not a type change.
-- ---------------------------------------------------------------------------
create table if not exists public.ctrl_status (
  id bigint generated by default as identity primary key,
  code text not null,
  language text not null,                      -- PTG / ENG / ... (3-letter, as the data files)
  name text not null,
  constraint ctrl_status_key unique (code, language)
);

insert into public.ctrl_status (code, language, name) values
  ('1', 'PTG', 'Automático'), ('1', 'ENG', 'Automatic'),
  ('2', 'PTG', 'Manual'),     ('2', 'ENG', 'Manual'),
  ('3', 'PTG', 'Desligado'),  ('3', 'ENG', 'Off')
on conflict (code, language) do nothing;

-- ---------------------------------------------------------------------------
-- 2. interventions — the real INTERVENTION field set.
--
--    The live table is (id, created_at, user_id, checklist_id, installation_id).
--    The spec keys an intervention on (Code, Code_Pump_Gr, Code_Inst, Code_Customer):
--    an intervention is PER PUMP GROUP, not per installation. Sheet 5/6 confirms it —
--    every REPORTS entry walks Installation -> Pump Group -> Intervention.
--
--    `pump_id` is nullable ONLY because the existing rows have no pump to point at and the
--    /new-intervention route does not collect one yet. New interventions must set it; see
--    docs/intervention-lifecycle.md.
-- ---------------------------------------------------------------------------
alter table public.interventions
  add column if not exists code integer,
  add column if not exists date_start date,
  add column if not exists date_end date,
  add column if not exists ref_month text,          -- S(10), the intervention's display key
  add column if not exists process_ref text,        -- S(10)
  add column if not exists language text,           -- 3-letter spec key
  add column if not exists period integer,          -- PERIODICITY code
  add column if not exists controler_status text,   -- -> ctrl_status.code
  add column if not exists verifyed_by text,        -- [1] must be one of the intervention's technicians
  add column if not exists responsable text,        -- [1] idem
  add column if not exists date_report date,
  add column if not exists locked boolean not null default false;

select pg_temp.add_ref_column('interventions', 'pump_id', 'pumps', 'id');

-- Report Nr., same treatment as checklists.code in 20260812.
update public.interventions set code = id where code is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'interventions_code_key') then
    alter table public.interventions add constraint interventions_code_key unique (code);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. INT_RESULT — the pass/fail answer for one CL_ACTION on one intervention.
--
--    Identity is (intervention, action). The composite code columns are the snapshot
--    described at the top; cl_action_id is the live link and goes null if the template
--    row is re-imported away.
-- ---------------------------------------------------------------------------
create table if not exists public.int_result (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  intervention_id bigint not null references public.interventions (id) on delete cascade,

  cl_action_id bigint references public.cl_action (id) on delete set null,

  -- Snapshot of the spec's composite CL_ACTION key. Survives a template re-import.
  checklist_id bigint not null,
  code_gr integer not null,
  code_sub_gr integer not null,
  code_action integer not null,

  result text not null,

  constraint int_result_identity_key
    unique (intervention_id, checklist_id, code_gr, code_sub_gr, code_action),
  constraint int_result_result_check
    check (result in ('V', 'X', '-', '*'))
);

-- ---------------------------------------------------------------------------
-- 4. INT_NOTES — free text hanging off a result, or standing alone.
--
--    The spec writes Code_Interv_Result = 0 for the "Add additional notes?" case
--    (sheet 5/6, marked [Rev1]) — i.e. a note about the intervention as a whole rather than
--    about one action. That sentinel 0 is modelled as NULL here: a real FK cannot hold it,
--    and "no result" is what it means.
-- ---------------------------------------------------------------------------
create table if not exists public.int_notes (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  intervention_id bigint not null references public.interventions (id) on delete cascade,
  int_result_id bigint references public.int_result (id) on delete cascade,
  text text not null
);

-- ---------------------------------------------------------------------------
-- 5. MEASUREMENTS — the numeric reading for one CL_ACTION_VALUES slot.
--
--    Spec type is N(6.1): up to 6 integer digits, 1 decimal -> numeric(7,1).
--    Same FK + snapshot pattern as int_result; `code_values` is the Form4 INDEX column,
--    so an action taking RPM after start / 10 min / 15 min stores three rows.
-- ---------------------------------------------------------------------------
create table if not exists public.measurements (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  intervention_id bigint not null references public.interventions (id) on delete cascade,

  cl_action_values_id bigint references public.cl_action_values (id) on delete set null,

  checklist_id bigint not null,
  code_gr integer not null,
  code_sub_gr integer not null,
  code_action integer not null,
  code_values integer not null,                -- [F] INDEX in Form4_Measurements.xlsx

  value numeric(7, 1),

  constraint measurements_identity_key
    unique (intervention_id, checklist_id, code_gr, code_sub_gr, code_action, code_values)
);

-- ---------------------------------------------------------------------------
-- 6. TECHNICIAN_INT1 / TECHNICIAN_INT2 -> one table with a slot.
--
--    INTERVENTION.Verifyed_By and .Responsable carry spec note [1]: "this field must have
--    one occurence from tables TECHNICIAN_INT1 or TECHNICIAN_INT2". That rule spans tables
--    and is enforced in the write path, not here.
--
--    A technician in this codebase is a `profiles` row with role 4 or 5 plus a `technician`
--    detail row keyed on `profile_id` (see actions/serverActions/technician.actions.ts).
--    The FK therefore points at `profiles`, which is guaranteed to exist and to be unique;
--    "is actually a technician" is a role check in the write path, not a constraint here.
-- ---------------------------------------------------------------------------
create table if not exists public.intervention_technicians (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  intervention_id bigint not null references public.interventions (id) on delete cascade,
  slot smallint not null,
  constraint intervention_technicians_key unique (intervention_id, slot),
  constraint intervention_technicians_slot_check check (slot in (1, 2))
);

select pg_temp.add_ref_column('intervention_technicians', 'profile_id', 'profiles', 'id');

do $$
begin
  -- Added via the helper (type copied from profiles.id), so NOT NULL comes after.
  if exists (
    select 1 from pg_attribute
     where attrelid = 'public.intervention_technicians'::regclass
       and attname = 'profile_id' and attnum > 0 and not attisdropped
  ) and not exists (select 1 from public.intervention_technicians where profile_id is null)
  then
    alter table public.intervention_technicians alter column profile_id set not null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Indexes for the read path (one intervention -> all its answers).
-- ---------------------------------------------------------------------------
create index if not exists int_result_intervention_idx
  on public.int_result (intervention_id, code_gr, code_sub_gr, code_action);
create index if not exists int_notes_intervention_idx  on public.int_notes (intervention_id);
create index if not exists int_notes_result_idx        on public.int_notes (int_result_id);
create index if not exists measurements_intervention_idx
  on public.measurements (intervention_id, code_gr, code_sub_gr, code_action, code_values);
create index if not exists intervention_technicians_idx
  on public.intervention_technicians (intervention_id);
create index if not exists interventions_pump_idx      on public.interventions (pump_id);

-- ---------------------------------------------------------------------------
-- 8. RLS.
--
--    ctrl_status is reference data: everyone reads, admin writes (it becomes an upload).
--    The intervention tables are OPERATIONAL data written by technicians from Screen#09,
--    NOT by the administrator — so is_admin() must not gate them, unlike the cl_* template
--    tables in 20260812. They inherit their owner from the parent intervention, and
--    `interventions` already carries user_id.
--
--    NOTE: `interventions` own policies are left as they are — this migration does not
--    change who can see an intervention, only what hangs off one. The child policies
--    delegate to the parent, so tightening `interventions` later tightens these too.
--
--    The `locked` gate is deliberately NOT expressed as an RLS rule. Sheet 5/6 has the
--    administrator receiving a finalised report by email and "View existing" reading locked
--    interventions back; a blanket "no writes when locked" policy would also block that.
--    Print is what Locked gates, and that check lives in the read path.
-- ---------------------------------------------------------------------------
alter table public.ctrl_status enable row level security;
drop policy if exists ctrl_status_select on public.ctrl_status;
create policy ctrl_status_select on public.ctrl_status
  for select to authenticated using (true);
drop policy if exists ctrl_status_write on public.ctrl_status;
create policy ctrl_status_write on public.ctrl_status
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

do $$
declare t text;
begin
  foreach t in array array[
    'int_result', 'int_notes', 'measurements', 'intervention_technicians'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format($p$
      create policy %I on public.%I for select to authenticated
      using (exists (select 1 from public.interventions i
                     where i.id = %I.intervention_id))
    $p$, t || '_select', t, t);

    execute format('drop policy if exists %I on public.%I', t || '_write', t);
    execute format($p$
      create policy %I on public.%I for all to authenticated
      using      (exists (select 1 from public.interventions i
                          where i.id = %I.intervention_id))
      with check (exists (select 1 from public.interventions i
                          where i.id = %I.intervention_id))
    $p$, t || '_write', t, t, t);
  end loop;
end $$;

commit;
