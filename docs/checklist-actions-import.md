# Check-List Actions Import — Action#04 / Action#22

Working notes for the Groups / Sub-Groups / Actions import. Last updated 2026-08-05.

## Spec source

In the repo at `app/assets/`, Equitotal *FIREPUMP25 — Menu(s) Structure / organization*, dated 2025.04.13:

- `FP25-INFOLOG-R1-Menus1.pdf` — sheet 4/6: login, registration, Administrator menu (Screen#03),
  New Check-List (PopUp#07), Service Provider menu. Actions #01–#23. This is the sheet that covers
  Action#04 and Action#22, plus the RELATED TABLES legend.
- `FP25-INFOLOG-R1-Menus2.pdf` — sheet 5/6: Customer menu (Screen#09), installations, pump groups,
  customer technicians, interventions and reports. Actions #14–#31.

Both are single-page CAD-style flow diagrams. Sheet 5/6 names the check-list action rows
`table.CL_ACTION:Code` — that is the spec's name for what the DB calls `checklistactions`.

Related spreadsheets named in the drawing's legend, none of which we have:

| File | Legend classification | Contents per legend |
| --- | --- | --- |
| `Report_Actions.xlsx` | DATA-INPUT | Names of Groups / Sub-Groups / Actions, **in several languages** |
| `Table_Peridiocity.xlsx` (sic) | OPERATIONAL | Names of actions periodicity |
| `Table_Language.xlsx` | OPERATIONAL | Available languages |
| `#Actions.xlsx` | SYSTEM | List of actions |
| `Emails.xls` | SYSTEM | Base text for sending emails |
| `#Screens_Pop-ups List.xlsx` | OPERATIONAL | List of screens and pop-ups |

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

`SF#053` on Screen#03 (Administrator menu). This is the operation that loads `Report_Actions.xlsx`
into the system — note the label covers **languages *and* actions**, i.e. the multilingual names, not
just a list of codes. `Action#23` is the equivalent for `Table_Peridiocity.xlsx`.

Screen#03 also has: Validate Customer access (`SF#050`), Validate Supplier access (`SF#052`),
Delete Customer's Data, Check-List (`SF#160`), LogOut.

### Why #22 comes before #04

The drawing does **not** state whether Action#04 reads the spreadsheet directly or reads a catalog
already in the DB. The strongest evidence for the latter: Action#22/#23 exist precisely to ingest
those spreadsheets, and would be redundant if #04 parsed them too. So the working assumption is:

- **Action#22 (admin, occasional)** — parse xlsx → populate the groups / sub-groups / actions catalog.
  This is where spreadsheet parsing and a "bad spreadsheet" error report belong.
- **Action#04 (per check-list)** — read the catalog from the DB → bulk-insert `checklistactions`.
  Its error branch is about *this* operation: catalog empty, no actions matched, duplicate codes.

**Unconfirmed with the client.** The word "Import" on `SF#081` is genuinely ambiguous.

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
  Report_Actions.xlsx carries action names in several languages too, so `description` needs the same
  `jsonb` treatment — deferred out of step 1 because it touches every existing action row and the
  whole intervention read / print path. Do it as part of Action#22, before any real import.
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

## Open questions for the client

Blocking:

1. **Send `Report_Actions.xlsx` and `Table_Peridiocity.xlsx`** — even partial or draft. Without the
   real files the column layout, sheet names, how the several-languages columns are arranged (one
   column per language? one row per language? a `lang` column?), whether group/sub-group codes are
   numeric or strings, and how periodicity is expressed are all unknown. A parser written against a
   guessed layout is throwaway work.
2. **Are Groups / Sub-Groups a fixed NFPA-25 taxonomy or user-editable data?** Fixed → tables + seed,
   and #22 is mostly a viewer plus re-import. Editable → full CRUD with multilingual name editing,
   a considerably bigger screen.
3. **Does an Action#22 re-import replace the whole catalog or merge into it?** And what happens to
   check-lists already referencing an action whose code disappears from the new file? This is the
   main correctness risk in a re-import.

Non-blocking:

4. **Action#04 source** — xlsx upload per check-list, or read the catalog loaded by #22?
5. **What produces "Errors found"**, and does the user see the error list or only the label?
   (`SF#082`/`SF#084` are numbered like they might be buttons.)
6. **Is the import mandatory before OK?** Can a check-list be saved with no groups/sub-groups, or
   does OK stay disabled until an import succeeds?
7. **Scope of Action#04** — all groups/sub-groups from the catalog, or does the user pick which apply?
8. Confirm the Name / NFPA_Edition swap above so it can be fixed.

## Next steps

1. ~~**Schema**~~ — done 2026-08-05, see "Already built" above. **Run the migration.** ← do this
2. **Admin catalog screen on Screen#03** — view (and per Q2 maybe edit) groups / sub-groups / actions.
   Unblocked; `useGroups` / `useSubgroups` and `addGroup` / `addSubgroup` already exist for it.
   Also needs sub-group codes on the manual `NewAction` form, which still cannot set a group. ← then here
3. **Action#22 import** — parse, validate, report errors. Blocked on Q1.
4. **Action#04** — bulk-insert `checklistactions` from the catalog; wire up the existing stub and the
   No errors / Errors found branch. Blocked on Q4 (and needs step 1).
