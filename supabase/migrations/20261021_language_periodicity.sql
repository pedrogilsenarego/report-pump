-- Action#22 (Update Languages Table) and Action#23 (Update Periodicity Table) — the two
-- reference-table uploads on the Administrator menu (Screen#03).
--
-- `languages`   <- Table_Language.xlsx      CODE | NAME | COUNTRY | FLAG
-- `periodicity` <- Table_Peridiocity.xlsx   CODE | LANG1 | TEXT1 | LANG2 | TEXT2
--
-- The spec models PERIODICITY and MAINT_TYPE as two tables loaded from the same file with
-- the same shape (docs/data-model.md, flagged [?]). They are one table here: CL_ACTION.Period
-- holds these codes and nothing distinguishes a "maintenance type" from a period.
--
-- Seeded with the values the app has hard-coded until now (constants/actions.ts), so
-- applying this changes nothing visible until an administrator uploads a new workbook.
-- `languages` is plural because LANGUAGE is a SQL keyword.
--
-- Read: any authenticated user (labels, pickers). Write: administrators only, via is_admin()
-- from 20260812_cl_checklist_tree.sql — the upload route checks the role as well, for a
-- clear 403.

begin;

create table if not exists public.languages (
  code    text primary key check (char_length(code) = 3),
  name    text not null,
  country text,
  flag    text
);

create table if not exists public.periodicity (
  code     integer not null,
  language text    not null,
  text     text    not null,
  primary key (code, language)
);

alter table public.languages   enable row level security;
alter table public.periodicity enable row level security;

drop policy if exists languages_select on public.languages;
create policy languages_select on public.languages
  for select to authenticated using (true);
drop policy if exists languages_write on public.languages;
create policy languages_write on public.languages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists periodicity_select on public.periodicity;
create policy periodicity_select on public.periodicity
  for select to authenticated using (true);
drop policy if exists periodicity_write on public.periodicity;
create policy periodicity_write on public.periodicity
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.languages (code, name, country, flag) values
  ('PTG', 'Português', 'Portugal',    'Flag_PTG.jpg'),
  ('ENG', 'English',   'England',     'Flag_ENG.jpg'),
  ('ENS', 'English',   'Scotland',    'Flag_ENS.jpg'),
  ('ENU', 'English',   'US',          'Flag_ENU.jpg'),
  ('FRA', 'François',  'France',      'Flag_FRA.jpg'), -- [sic], as in the workbook
  ('ESP', 'Español',   'España',      'Flag_ESP.jpg'),
  ('GER', 'Deutsch',   'Deutschland', 'Flag_GER.jpg')
on conflict (code) do nothing;

insert into public.periodicity (code, language, text) values
  (1, 'PTG', 'Semanal'),    (1, 'ENG', 'Weekly'),
  (2, 'PTG', 'Mensal'),     (2, 'ENG', 'Monthly'),
  (3, 'PTG', 'Trimestral'), (3, 'ENG', 'Quarterly'),
  (4, 'PTG', 'Semestral'),  (4, 'ENG', 'Semestrally'),
  (5, 'PTG', 'Anual'),      (5, 'ENG', 'Annually'),
  (6, 'PTG', 'Bienal'),     (6, 'ENG', 'Bi-Annually'),
  (7, 'PTG', '3-anual'),    (7, 'ENG', '3-Annually'),
  (8, 'PTG', '5-Anual'),    (8, 'ENG', '5-Annually')
on conflict (code, language) do nothing;

commit;
