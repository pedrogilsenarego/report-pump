# Check-List Actions Import — Action#04 / Action#22

Working notes for the Groups / Sub-Groups / Actions import. Last updated 2026-08-03.

## Spec source

`C:\Users\pedro\Downloads\FP25-INFOLOG-R1-Menus1 (1).pdf` — Equitotal, *FIREPUMP25 — Menu(s) Structure /
organization*, sheet 4/6, dated 2025.04.13. Single-page CAD-style flow diagram of all screens, pop-ups
and actions. **Move this file into the repo or a shared drive — it currently only exists in Downloads.**

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

- **No groups or sub-groups anywhere in the DB.** `code_group` / `code_subgroup` exist only as plain
  integers on `checklistactions`, assigned per check-list. Group *names* are hardcoded in the
  translation files as `checklists.groupTitle` (`"1"`: Pre-Test Inspections, `"2"`: Checks and Tests
  (VE)), rendered by `components/atoms/InterventionComponents.tsx`. Sub-group names have no display.
- **`actions` has no group / sub-group columns** (`types/action.types.ts` is `id, created_at,
  pump_type, description, period`), so a catalog action belongs to no group. This blocks Action#04.
- **No spreadsheet parser and no file input** — `package.json` has no `xlsx` / `papaparse` / `exceljs`.
- `addChecklist` inserts only the `checklists` header row; nothing anywhere writes `checklistactions`,
  so every new check-list is created empty even though the whole read/display side expects it filled.
- Action#22 and #23 are entirely unimplemented — the only way actions reach the catalog today is the
  manual form.

Minor, unrelated to the import:

- **Name / NFPA_Edition defaults are swapped vs the spec.** `useNewChecklist.ts` sets
  `name: "NFPA-25 Last Edition"` and `nfpaEd: ""`; the spec puts that default on NFPA_Edition and
  makes Name a BROWSE over existing `CHECK_LIST:Name` values (currently a free-text input).
- `mapActionToRaw` (`mappers/actions.mapper.ts`) drops `pumpType`.
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

1. **Schema** — `groups` / `subgroups` tables with per-language names; add `code_group` /
   `code_subgroup` to `actions`. Needed under every reading of the spec, depends on no client answer.
   Prerequisite for both #22 and #04. Also retires the hardcoded `groupTitle` strings. ← start here
2. **Admin catalog screen on Screen#03** — view (and per Q2 maybe edit) groups / sub-groups / actions.
3. **Action#22 import** — parse, validate, report errors. Blocked on Q1.
4. **Action#04** — bulk-insert `checklistactions` from the catalog; wire up the existing stub and the
   No errors / Errors found branch. Blocked on Q4 (and needs step 1).
