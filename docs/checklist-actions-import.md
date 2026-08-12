# Check-List Actions Import — Action#04 / Action#22

Working notes for the Groups / Sub-Groups / Actions import. Last updated 2026-08-07.

> **2026-08-07 — the full spec bundle arrived.** The spreadsheets this document was blocked on
> are now in `app/assets/`. Most open questions below are answered; the sections marked
> *(superseded)* record what we assumed before the files existed. See:
>
> - **`data-model.md`** — the table/field/relation spec from drawing pages 1–3.
> - **`spec-inputs.md`** — extracted contents of all 14 `.xlsx` files, including the exact
>   column layouts Action#04 has to parse and the full action pseudocode from `#Actions.xlsx`.
>
> Headline: **Action#04 parses the four `Form*.xlsx` files directly**; Action#22/#23 only load
> `LANGUAGE` / `MAINT_TYPE`. Groups and sub-groups are **per-check-list**, not a global catalog,
> which conflicts with the already-written `20260805_groups_subgroups.sql`.

## Spec source

In the repo at `app/assets/`, Equitotal *FIREPUMP25 — Menu(s) Structure / organization*, dated 2025.04.13:

- `FP25-INFOLOG-R1-Menus1.pdf` — sheet 4/6: login, registration, Administrator menu (Screen#03),
  New Check-List (PopUp#07), Service Provider menu. Actions #01–#23. This is the sheet that covers
  Action#04 and Action#22, plus the RELATED TABLES legend.
- `FP25-INFOLOG-R1-Menus2.pdf` — sheet 5/6: Customer menu (Screen#09), installations, pump groups,
  customer technicians, interventions and reports. Actions #14–#31.

Both are single-page CAD-style flow diagrams. Sheet 5/6 names the check-list action rows
`table.CL_ACTION:Code` — that is the spec's name for what the DB calls `checklistactions`.

Pages 1–3 and 6 (`-p1`, `-p2`, `-p3`, `-Outputs`) arrived on 2026-08-07 and are transcribed in
`data-model.md`. The older `Spec1.pdf`–`Spec5.pdf` were the same drawings under provisional
names and have been removed.

Related spreadsheets named in the drawing's legend — **all now present** except as noted, and
extracted in `spec-inputs.md`:

| File | Legend classification | Contents per legend |
| --- | --- | --- |
| ~~`Report_Actions.xlsx`~~ | DATA-INPUT | Never existed under this name. Split across `Form1_Groups.xlsx`, `Form2_Sub_Groups.xlsx`, `Form3_Actions.xlsx`, `Form4_Measurements.xlsx` |
| `Table_Peridiocity.xlsx` (sic) | OPERATIONAL | 8 periodicities, PTG + ENG |
| `Table_Language.xlsx` | OPERATIONAL | 7 locales, keyed `PTG`/`ENG`/`ENS`/`ENU`/`FRA`/`ESP`/`GER` |
| `#Actions.xlsx` | SYSTEM | Pseudocode for all 31 actions — the implementation spec |
| `Emails.xls` | SYSTEM | Present as `#Emails.xlsx`; bodies are still placeholders |
| `#Screens_Pop-ups List.xlsx` | OPERATIONAL | 14 screens + 43 pop-ups |

Also in the bundle and not previously known: `Table_Ctrl_Status.xlsx`, `Table_Field_Names.xlsx`
(605 UI strings — the i18n source), `#Tipos Sub-Grupo(.NP).xlsx` (sub-group → pump-type
applicability matrix), and `#00 FP25 Index Dev_File R1.xlsx` (the spec manifest).

## What the two actions are

### Action#04 — Groups / Sub-Gr Import (per check-list)

Sits on the New Check-List form (PopUp#07), reached from the Administrator menu (Screen#03 →
`SF#160` Check-List):

```
NEW CHECK-LIST — Data definition                      [PopUp#07]
  Report Nr.   = table.CHECK_LIST:Code+1   (auto)
  Date*        = default current date (yyyy.mm.dd)
  Name*        = BROWSE over table.CHECK_LIST:Name          <-- see discrepancy below
  NFPA_Edition = default "NFPA-25 Last Edition"             <-- see discrepancy below
  Company Resp.* / Person responsible* / Phone / Email

  [SF#088] OK        [SF#081] Groups / Sub-Gr Import        [SF#087] Cancel
                                  |
                              [Action#04]
                                  |
                     +------------+------------+
               [SF#082/#083]            [SF#084/#085]
                "No errors"             "Errors found"
```

Its output is one `checklistactions` row per (group, sub-group, action) for this report.

### Action#22 — Update Languages Table / Actions (admin, global)

`SF#053` on Screen#03 (Administrator menu). The menu label reads "languages *and* actions", which
is what led to the superseded assumption below — but `#Actions.xlsx` spells out that #22 loads
**only** `table.LANGUAGES` from `Table_Language.xlsx`, with a success/failure pop-up. `Action#23`
is the equivalent for `MAINT_TYPE` from `Table_Peridiocity.xlsx`. Neither touches actions.

Screen#03 also has: Validate Customer access (`SF#050`), Validate Supplier access (`SF#052`),
Delete Customer's Data, Check-List (`SF#160`), LogOut.

### Why #22 comes before #04 *(superseded 2026-08-07)*

The working assumption was that #22 populates a global catalog and #04 copies from it. **That was
wrong.** `#Actions.xlsx` and drawing p3 both show #04 parsing the form files directly:

```
#04   Clear ScreenField082
      Fill table.CL_GR_TEXT     from [source]  with table.CHECK_LIST:Code = [current]
      Fill table.CL_SUBGR_TEXT  from [source]  with "
      Fill table.CL_ACTION_TEXT from [source]  with "
      Fill table.CL_DETAIL_TEXT from [source]  with "
      No errors found:  Create Record table.CHECK_LIST with data from screen
                        Set ScreenField082 = " X " ; Activate ScreenField#088
      Errors found:     Set ScreenField084 = " X "
```

Correct division of labour:

- **Action#04 (per check-list, from PopUp#07)** — parse `Form1_Groups`, `Form2_Sub_Groups`,
  `Form3_Actions`, `Form4_Measurements` → insert `CL_GR(_TEXT)`, `CL_SUB_GR(_TEXT)`,
  `CL_ACTION(_TEXT)`, `CL_ACTION_VALUES`/`CL_VALUES_TEXT`, all stamped with the current
  `CHECK_LIST:Code`. Spreadsheet parsing and the error branch belong **here**.
- **Action#22 (admin, Screen#03)** — `LANGUAGE` from `Table_Language.xlsx`, nothing else.
- **Action#23 (admin, Screen#03)** — `MAINT_TYPE` from `Table_Peridiocity.xlsx`, nothing else.

`SF#088` (OK) is only *activated* on a successful import, so the import **is** mandatory.
`SF#082`/`SF#084` are set to `" X "` — indicators, not buttons; the user sees no error detail.

## Current repo state

Already built:

- **Groups / Sub-Groups catalog (step 1, done 2026-08-05).**
  `supabase/migrations/20260805_groups_subgroups.sql` — `groups` / `subgroups` tables keyed on the
  spec's integer `Code`, multilingual names as `jsonb` (`{"en": ..., "pt": ...}`), `code_group` /
  `code_subgroup` added to `actions` with a composite FK into `subgroups (code_group, code)`, RLS
  (read: any authenticated user; write: admin only, via a `public.is_admin()` SECURITY DEFINER
  helper). Seeds groups 1 and 2 with the strings that used to be hardcoded translations.
  **The migration still has to be run — there is no Supabase CLI linked, so paste it into the SQL
  editor.** Nothing else in this list works until it is applied.
  Code side: `types/group.types.ts`, `mappers/groups.mapper.ts`,
  `actions/clientActions/groups.actions.ts` (`getGroups` / `getSubgroups` / `addGroup` /
  `addSubgroup`), `hook/useGroups.ts`, `utils/localizedName.ts` (current lang → pt → en → any),
  and `InterventionGroupTitle` now takes the catalog `name` instead of reading
  `checklists.groupTitle`, which is deleted from `en.ts` / `pt.ts`.
- New Check-List header form — `modules/Interventions/components/NewChecklist.tsx`, auto Report Nr.
  via `nextCode` in `useNewChecklist.ts`, date default `yyyy.mm.dd`.
- `SF#081` import button + the `SF#082-085` No errors / Errors found result line — added, but
  `onImport` in `useNewChecklist.ts` is a **deliberate stub** pending the source decision. Nothing
  is imported and the status never shows.
- `actions` catalog table with rows, `getActions` / `addAction`
  (`actions/clientActions/actions.actions.ts`), manual one-at-a-time add form in `modules/Checklists/`.
- `checklistactions` join table — schema, read path (`checklists.actions.ts` `getCheckList`), types
  (`types/checklist.types.ts`), and the `groupByCodeGroup` display helper (`utils/checklist.ts`).

Gaps:

- **Sub-group names still have no display anywhere.** The catalog stores them; nothing renders them.
  `InterventionGroup` prints `codeGroup.code` only.
- **`actions.description` is still single-language** while group / sub-group names are multilingual.
  `Form3_Actions.xlsx` carries action names in several languages, plus a per-language `Type` and
  `Source` (NFPA clause) that `description` has no room for at all — see `CL_ACTION_TEXT` in
  `data-model.md`. Deferred out of step 1 because it touches every existing action row and the
  whole intervention read / print path. Do it as part of Action#04, before any real import.
- **`checklistactions` has no FK to the catalog, on purpose** — the rows are a per-report snapshot
  that must survive a re-import dropping an action (Q3). This means a check-list can reference a
  `code_group` that no longer exists in `groups`; `InterventionGroupTitle` degrades to the bare code.
- **No spreadsheet parser and no file input** — `package.json` has no `xlsx` / `papaparse` / `exceljs`.
- `addChecklist` inserts only the `checklists` header row; nothing anywhere writes `checklistactions`,
  so every new check-list is created empty even though the whole read/display side expects it filled.
- Action#22 and #23 are entirely unimplemented — the only way actions reach the catalog today is the
  manual form.

Minor, unrelated to the import:

- **Name / NFPA_Edition defaults are swapped vs the spec.** `useNewChecklist.ts` sets
  `name: "NFPA-25 Last Edition"` and `nfpaEd: ""`; the spec puts that default on NFPA_Edition and
  makes Name a BROWSE over existing `CHECK_LIST:Name` values (currently a free-text input).
- ~~`mapActionToRaw` (`mappers/actions.mapper.ts`) drops `pumpType`.~~ Fixed in step 1 — it now writes
  `pump_type`, `code_group` and `code_subgroup`.
- The spec spells the table both `SUPPLYER` and `SUPPLIER`; `Peridiocity` is a typo for periodicity.

## 2026-08-12 — schema applied, parser written

- `supabase/migrations/20260812_cl_checklist_tree.sql` **is applied** (SQL editor). It replaces
  `20260805_groups_subgroups.sql`, which was deleted — never run, wrong shape. Eight tables:
  `cl_gr`, `cl_sub_gr`, `cl_action`, `cl_action_values` + their `_text` siblings, scoped by
  `checklist_id` -> `checklists.id`, admin-only RLS via `is_admin()`.
- **Also fixed there: `checklists` was missing its entire PopUp#07 header block.** The live table
  held only `(id, nfpa_ed, created_at)` while `mapChecklistToRaw` wrote `date` / `name` /
  `company_resp` / `name_resp` / `ph` / `email` — so `addChecklist` failed with 42703 on every
  submit, and `nextCode` read a `code` column that did not exist. Columns added, `code`
  backfilled to `id` for the 6 existing rows and made unique.
- `lib/forms/parseChecklistForms.ts` — the Action#04 parser. Pure (takes `ArrayBuffer`s), so it
  runs in the browser or a route handler; the client/server decision is still open. Language
  blocks are **derived from the row-6 labels** (`LANG1`/`NAME1`, and `LANG1`/`TYPE1`/`SOURCE1`/
  `NAME1` in Form3), never a hardcoded stride. `scripts/parseFormsCheck.ts` runs it over
  `app/assets/` — `npx tsx scripts/parseFormsCheck.ts`.
- Verified against the real files: template **1** yields 4 groups / 16 sub-groups but **60
  referential errors**, all `Form4` rows naming `GROUP=2` actions absent from `Form3`.
  Template **2** yields 4 groups / 17 sub-groups and **zero actions**, because `Form3` carries
  only check-list-1 rows. So neither template can currently be imported — exactly the
  `Form3_Actions` gap below, now demonstrated rather than inferred.
- Validation rules are ours, not the spec's (open question 5 never got answered): structural
  (label row found, required identity columns present, at least one `LANG`/`NAME` pair),
  duplicate identity tuples, referential integrity child->parent, and a template yielding no
  actions at all. Empty template rows carrying only a `CODE` are skipped silently.

### Action#04 is wired (2026-08-12)

- `app/api/checklists/import/route.ts` — POST multipart. Admin-gated twice (explicit
  `profiles.role` check for a clean 403, then RLS `is_admin()`), parses server-side, and is
  **two-phase**: `dryRun=1` from `SF#081` validates and writes nothing; `SF#088` posts again
  and creates the `checklists` row plus the whole tree. `SF#088` is `disabled` until a dry run
  returns ok, and any change to the file inputs clears the verdict — so the import really is
  mandatory and a check-list can no longer be created empty.
- `lib/forms/insertChecklistTree.ts` — bulk insert per level, ids matched back by composite
  code. PostgREST cannot span statements in a transaction, so failure triggers a
  **compensating delete** of the `checklists` row, which cascades the partial tree away.
- Report Nr. is now assigned **server-side** from `max(code) + 1`; the client used to compute
  it, which two concurrent admins would collide on.
- `addChecklist` / `mapChecklistToRaw` were **deleted**. They inserted a header row with no
  tree — the exact bug being fixed — and nothing else called them.
- Read path repointed off the deleted global tables: `getGroups(checklistId)` /
  `getSubgroups(checklistId)` read `cl_gr` / `cl_sub_gr` with their `_text` children,
  `useGroups` / `useSubgroups` take a check-list id and key the query on it,
  `utils/specLanguage.ts` maps `PTG`/`ENG` -> `pt`/`en` on read.
- **Sub-group names now render** (`InterventionSubgroupTitle`, `groupByGroupAndSubgroup`) —
  the report nests group -> sub-group -> action. That closes the long-standing display gap.
- Verified against the live DB with `scripts/importTreeCheck.ts`: full tree inserts, reads
  back nested, duplicate identity rejected (23505), orphan sub-group rejected (23503),
  cascade delete leaves nothing behind.

### Still missing after that

- **The intervention path still reads the old `checklistactions` -> `actions` tables.** A
  check-list imported by Action#04 has `cl_action` rows and **no** `checklistactions` rows, so
  its actions do not appear in New Intervention or on the report — only its group and
  sub-group names do. Repointing `getCheckList` / `addIntervention` /
  `interventionchecklistactions` onto `cl_action` is the next piece of work, and it subsumes
  the old "`actions.description` -> multilingual" item, since `cl_action_text` already holds
  names, `type` and `source` per language.
- **Re-import (Q3) is not implemented.** Every import creates a *new* check-list; there is no
  path that re-imports into an existing one, which is the case that could orphan recorded
  `INT_RESULT` rows. Deliberate — the client has not answered replace-vs-merge.

## Open questions for the client

Answered by the 2026-08-07 bundle:

1. ~~**Send `Report_Actions.xlsx` and `Table_Peridiocity.xlsx`**~~ — **done.** Layouts are in
   `spec-inputs.md`. Multilingual arrangement is *repeating column blocks* (p3 calls them
   `Cycle-1..n`), 2 columns per language (4 for `Form3`). Codes are integers. Language keys are
   3-letter (`PTG`/`ENG`).
   **Residual ask: `Form3_Actions.xlsx` is incomplete** — 13 rows, all check-list 1 / group 1,
   and `Form4` references group-2 actions that do not exist in it. Need the full file.
2. ~~**Fixed taxonomy or user-editable?**~~ — **neither.** They are per-check-list imported data:
   `Form1` ships groups 1–4 twice, once per check-list template, with group 4's PTG name differing
   between them. No CRUD screen is called for; no global seed is correct.
4. ~~**Action#04 source**~~ — xlsx, parsed per check-list. See the superseded section above.
6. ~~**Is the import mandatory before OK?**~~ — **yes.** `SF#088` is activated only on success.

Still open:

3. **Does a re-import replace or merge?** Unchanged and still the main correctness risk. Now
   scoped more tightly: since the rows are per-check-list, a re-import within one check-list is
   the only case that matters — but `INT_RESULT` / `MEASUREMENTS` rows from completed
   interventions point at `CL_ACTION` by composite code, so dropping an action orphans real
   recorded data.
5. **What produces "Errors found"?** `#Actions.xlsx` confirms the user sees only a `" X "`
   marker, never a list. But what counts as an error is still unstated.
7. **Scope of Action#04** — all groups/sub-groups, or does the user pick? Related: which
   check-list template (`CHECK-LIST=1` or `2`) does a given import use, and where is that chosen?
   The forms carry the column; nothing in the spec says how its value is selected.
8. Confirm the Name / NFPA_Edition swap above. (p2 does add `Name* [Rev1] S(20)` to `CHECK_LIST`,
   consistent with Name being a real field, but the default-value question stands.)
9. **New — `CL_ACTION.Pump_Type` domain.** `#Tipos Sub-Grupo NP.xlsx` implies four categories
   (Sala SI / Jockey / B.Elétrica / B.Diesel) against `PUMP_GROUP.Type`'s three (`J`/`E`/`D`).
10. **New — `CTRL_STATUS` keys** are `1`/`2`/`3` in the xlsx but `A`/`M`/`0` in p3's pre-set table.
12. **New — is `Form2` row 32 a test row?** `02 / 03 / 10`, `Nova ação teste` /
    `New test action`. It is the only asymmetry between the two check-list templates' sub-group
    lists (16 vs 17) and its name says *action* in the sub-group file. Confirm before importing.
11. **New — Action#02 contains a hardcoded password** (`=="presidentE1990"`) as an alternative to
    a real user lookup. Will not be implemented; flag it to the client.

## Decision needed before writing more schema

`supabase/migrations/20260805_groups_subgroups.sql` was written against the pre-bundle
assumptions and conflicts with the spec in four ways (detailed at the end of `data-model.md`):
global vs. per-check-list keys, `jsonb` names vs. row-per-language `_TEXT` tables, `en`/`pt` vs.
`PTG`/`ENG`, and admin-only RLS on data that Action#04 writes from a non-admin screen.

**It has not been run yet**, so the cheap move is to replace it rather than migrate off it later.
Of the four, only the first is structural — a global `unique (code)` cannot hold `Form1`'s data at
all. The others are shape preferences.

## Next steps

1. **Resolve the schema conflict above** and rewrite `20260805_groups_subgroups.sql` as the
   per-check-list `CL_*` structure. ← do this first; nothing else is safe to build on
2. **Write the Form parser** — one function reading the row-6/7 header, striding the per-language
   blocks. Unblocked: layouts are known and the sample files are in `app/assets/`. Needs a
   spreadsheet lib (`package.json` still has none) and a decision on parsing client- or
   server-side.
3. **Action#04** — wire the existing `onImport` stub in `useNewChecklist.ts` to the parser, insert
   the four table sets stamped with the check-list code, and drive the `SF#082`/`SF#084` markers
   plus the `SF#088` enable. Blocked on Q3 only for the *re*-import path; the first-import path is
   unblocked.
4. **`actions.description` → multilingual**, plus `Type` and `Source` per language, per
   `CL_ACTION_TEXT`. Touches every existing action row and the intervention read/print path.
5. **Sub-group name display** — still nothing renders them (see Gaps).
6. **Action#22 / #23** — small now that they are known to load only `LANGUAGE` / `MAINT_TYPE`.
7. **i18n from `Table_Field_Names.xlsx`** — 605 strings, PT/EN populated. Separate track from the
   import, but it is the reason `translations/languages/` exists.
