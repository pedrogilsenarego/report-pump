# Intervention lifecycle — implementation notes

Backlog item 1 (`TODO.md`). Started 2026-08-31.

Spec: `screens-flows.md` § "Interventions — the lifecycle" (Screen#09 REPORTS block),
`data-model.md` for the field lists, `reports-outputs.md` for what the reports read back.

## What landed

### Schema — `supabase/migrations/20260831_intervention_lifecycle.sql`

> **NOT YET APPLIED.** There is no Supabase CLI linked and the Supabase MCP server timed out
> this session, so this has not touched the real database. It was verified against a
> throwaway `postgres:16-alpine` container with a stubbed copy of the live schema — see
> "How it was verified" below. **Run it in the SQL editor.**

| Table | Spec table | Notes |
| --- | --- | --- |
| `interventions` (+14 columns) | `INTERVENTION` | incl. `locked`, `pump_id`, `period`, `ref_month`, `controler_status` |
| `int_result` | `INT_RESULT` | one answer per action per intervention |
| `int_notes` | `INT_NOTES` | per-result or free-standing |
| `measurements` | `MEASUREMENTS` | `numeric(7,1)` = the spec's `N(6.1)` |
| `intervention_technicians` | `TECHNICIAN_INT1` + `TECHNICIAN_INT2` | one table, `slot in (1,2)` |
| `ctrl_status` | `CTRL_STATUS` | seeded with the 3 rows from `Table_Ctrl_Status.xlsx` |

Four decisions worth knowing (all argued in the migration header):

1. **Answers carry a FK *and* a code snapshot.** `int_result` / `measurements` store
   `cl_action_id` (`ON DELETE SET NULL`) *and* the composite
   `(checklist_id, code_gr, code_sub_gr, code_action)`. This defuses open question 3
   (replace-vs-merge on re-import): dropping a template action leaves completed
   interventions readable and printable instead of orphaning or cascading real field data.
   The read path joins on the **snapshot codes**, not the FK, for the same reason.
2. **`TECHNICIAN_INT1`/`2` collapse into one table with a `slot`.** The spec draws two
   identical tables and never says why (`data-model.md` marks it **[?]**).
3. **`locked` is boolean, not the spec's `I(1)` 1/2.** It is a pure internal gate, never
   loaded from a spreadsheet and never printed.
4. **`result` uses the spec's `V`/`X`/`-` domain**, plus the undocumented `*` from sheet 5/6
   so the CHECK does not reject data we were told to expect.

RLS on the four child tables **delegates to the parent intervention** rather than calling
`is_admin()`. These are operational rows written by technicians from Screen#09, unlike the
`cl_*` template tables which really are admin-only.

### Code

The intervention path was reading `checklists -> checklistactions -> actions`, the
pre-import catalog. **A check-list imported by Action#04 has `cl_action` rows and no
`checklistactions` rows**, so New Intervention and the report rendered group and sub-group
headings with nothing under them. That is now repointed:

- `types/clAction.types.ts`, `mappers/clAction.mapper.ts`,
  `actions/clientActions/clActions.actions.ts` — `getChecklistActions(checklistId)` reads
  `cl_action` + `cl_action_text` + `cl_action_values` + `cl_values_text`.
  `cl_action_text` carries three per-language strings (`text` / `type` / `source`), so it
  needs its own mapper rather than `textRowsToLocalizedName`.
- `actions/clientActions/interventions.actions.ts` — `addIntervention` writes the header,
  then `int_result`, `measurements` and `int_notes`. PostgREST cannot span statements in a
  transaction, so a failure part-way triggers a **compensating delete** of the intervention,
  which cascades the partial report away (same approach as `insertChecklistTree`).
  Plus `updateIntervention`, `lockIntervention` and a five-read `getIntervention`.
- `modules/NewIntervention/` — records result + n measurements + a per-action note, an
  "Add additional notes?" box, and a "Save and lock Report?" checkbox.
- `modules/Intervention/` — renders results, measurements, notes and the locked badge.
  **Print is disabled unless the report is locked**, with the spec's own message
  ("Report not Locked; cannot be printed") and a Lock button.
- Dead code removed: `getCheckList` / `useChecklist` and the `checklistactions(*)` embed on
  `getCheckLists`. They were unreferenced after the repoint and pointed at the deprecated
  tables — exactly the trap that caused the original bug.

### Bugs fixed along the way

These were listed under "Known bugs" in `TODO.md`; (1) and (3) are closed, (2) is now moot.

1. **Answers landed on the wrong actions.** Toggles were named `action_${index}` with
   `index` restarting at 0 inside every group, then read back against the unfiltered,
   ungrouped action array. Fields are now keyed on the action's identity
   (`r_<group>_<subgroup>_<action>`).
2. **Every action was pre-answered.** `ExclusiveMultiToggleForm` defaulted to
   `options[0].value`, so an untouched intervention saved a full set of "Falha" answers
   nobody gave. `defaultValue` is now an opt-in prop.
3. **The period filter was inverted.** `action.period >= period` kept the *less* frequent
   actions as the period code rose. PERIODICITY ascends from most to least frequent, so a
   monthly round must include the weekly checks: `isDueForPeriod` now tests `<=`.
4. **Every period label rendered was wrong.** `periodValues` was
   `["bianual","anual","trimester","semester","monthly","weekend"]`, read by 0-based index,
   against a spec table that is 1-based and in the opposite order. Replaced by `PERIODICITY`
   + `periodLabel()` with the eight real codes, PT and EN.

## Second pass — the rest of the lifecycle

### Pump group

The spec keys an intervention on the **pump group** (`Code_Pump_Gr`) and every REPORTS entry
on sheet 5/6 walks Installation → Pump Group → Intervention, so the route gained a segment:
`/new-intervention/[checklist]/[installation]/[pump]/[period]`. The start dialog now asks for
the pump group after the installation, narrowing the list to that installation's groups and
showing the spec's own empty state ("There are no Pump Groups defined for this
Installation!"). `pump_id` is written on create.

That also switches on the **`CL_ACTION.Pump_Type` filter** (`appliesToPumpType`), which is
what `xType = PUMP_GROUP:Type` on sheet 5/6 is for. It is deliberately **permissive**: an
action with no `Pump_Type`, or a pump with no `type`, is kept. `pumps.type` is still free
text (backlog item 3) and the four-vs-three category mismatch is unresolved, so filtering an
action *out* wrongly would silently drop a required check from a report — the failure mode
worth avoiding.

### Header fields, technicians, controller status

`InterventionHeaderFields` collects `Ref_Month`, `Controler_Status` (from the seeded
`ctrl_status`), and technicians for slots 1 and 2 (`intervention_technicians`).

`Verifyed_By` / `Responsable` carry spec note [1] — each must name one of the intervention's
own technicians — so they are **selects over the two technicians chosen above them**, not
free text. The rule spans tables and cannot be a DB constraint, so it is also re-checked
server-side in `headerNames()`: a stale name that no longer belongs to a slot is dropped
rather than saved.

### Finalise existing / View existing

Sheet 5/6 draws these as the same screen with BROWSE vs EDIT semantics, so
`/intervention/[id]` serves both, keyed on `Locked` — which is the distinction the spec's own
flag already carries. Unlocked shows a **Finalise existing** button that seeds an editable
form from what was recorded; locked is read-only. `updateIntervention` refuses to write to a
locked report ("the spec draws no unlock path").

The answer tree is shared between create and finalise
(`modules/Intervention/components/InterventionAnswerFields.tsx`) so the two cannot drift.

**The update path does not use a compensating delete** — the intervention already exists and
throwing it away on a partial failure would destroy the data being edited. Instead results
and measurements **upsert on their identity keys**, so a failure leaves the previous values
in place, and rows the user cleared are removed only once the new ones are safely in. Notes
have no natural key, so they are replaced; that one destructive step runs last.

The editable list is the actions the report **already answered**, not the whole template.
Re-deriving it from period + pump type could silently drop an answer recorded under a
different filter.

### The two finalise emails

`app/api/interventions/finalise/route.ts` sends both, from every path that locks a report
(create-and-lock, finalise-and-lock, the standalone Lock button):

1. the four IDs plus every `CL_ACTION` code where `INT_RESULT:Result` is `'X'` or `'*'`;
2. every `INT_NOTES` row on the intervention.

**The body text is ours.** `#Emails.xlsx` has only TO and SUBJECT for its two templates and a
literal `....` for CONTENTS, and neither of these two emails is in that file at all. The
bodies state the IDs and codes the drawing names and nothing more — replace them when the
client supplies real copy.

Mail failure is **non-fatal**: the lock is already committed and the spec gives no unlock
path, so a bounced SMTP connection must not make the save look like it failed. It comes back
as `warning` on the save result and is shown in the success toast.

## How it was verified

- `postgres:16-alpine` container, a stub of the live schema
  (`profiles`/`pumps`/`technician`/`checklists`/`interventions`/`cl_*`), then the migration.
- Runs clean; **idempotent** on a second run.
- `pumps.id` and `profiles.id` types are **not** knowable from the repo (the TS types say
  `string`, which here covers both uuid and a stringified bigint, and no migration creates
  either table). So `pump_id` and `profile_id` are added by a `pg_temp.add_ref_column`
  helper that copies the referenced column's real type. The stub deliberately makes both
  `uuid` to prove the helper works — both columns came out `uuid`.
- Behaviour checks, all passing:
  - `result` CHECK rejects a value outside `V`/`X`/`-`/`*`
  - duplicate `(intervention, action)` rejected
  - two technicians in one slot rejected; `slot = 3` rejected
  - **deleting a `cl_action` nulls `cl_action_id` but keeps the `int_result` row, its
    snapshot codes, its result and its measurement value** — the re-import guarantee
  - deleting an intervention cascades all four child tables to zero
- `tsc --noEmit` clean, `next lint` clean, `next build` succeeds (18/18 pages).

Second pass added seven more, all passing:

- **upsert on `int_result`'s identity key UPDATES rather than duplicating** — the guarantee
  the Finalise path rests on; same for `measurements`
- deleting an `int_result` cascades its notes (so clearing an answer on re-save is clean)
- swapping a technician between slots
- the finalise email's query: `result in ('X','*')` returns exactly the failed codes
- lock + read back `locked` / `date_report` / `ref_month` / `controler_status`
- `ctrl_status` seeded and joinable from `interventions.controler_status`

`tsc --noEmit` clean, `next lint` clean, `next build` succeeds (19 routes).

**Not verified against real data.** No migration has been applied and no intervention has
been created end to end, because the database is unreachable from here.

## Still to do

- **Apply the migration.** Nothing works until it is run — no Supabase CLI is linked and the
  MCP server timed out again on this pass.
- **Run one intervention end to end** against the real DB — the equivalent of
  `scripts/importTreeCheck.ts` for Action#04. Worth writing as a script.
- **Print is still `react-to-print`**, i.e. the browser print dialog. The spec wants a saved
  PDF (`[Input xLocation]`). That is backlog item 2, and it is blocked on the missing
  `FP25 - EQ0102 Rev7.pdf`.
- **`INTERVENTION` still has unused columns** — `process_ref`, `language`, `date_report` is
  only set on lock, and `code` is backfilled but never shown. They exist for the reports.

## Questions this raised for the client

Beyond the ones already in `spec-inputs.md`:

1. **Notes are prompted on `Result = "V" OR "*"`** (sheet 5/6) — but `V` is **Ok**. Asking
   for a note on a *passing* check reads like a slip for `"X"`. The admin failure email on
   the same sheet lists `'X' or '*'`, which supports that. Implemented as written (the note
   box is always available), but confirm.
2. **Can a locked report be edited?** The spec has *Finalise existing* set `Locked = 2` and
   *Print* require it, but never says a locked report is read-only. There is no unlock path
   drawn anywhere either.
3. **Is an unanswered action "not applicable" or "not done"?** Nothing is written for an
   action with no result, so the report simply omits it. The spec's blank report prints
   every action, which suggests the distinction may matter on the finished one.
