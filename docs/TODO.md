# FIREPUMP25 — Backlog

Derived from the full spec transcription (`data-model.md`, `spec-inputs.md`, `screens-flows.md`,
`reports-outputs.md`) against the repo, 2026-08-31. Ordered by how much else depends on it.

**(1) the intervention lifecycle is built** — see `intervention-lifecycle.md`. Its migration
still has to be run. Everything below it is registered, not started.

> **2026-09-16 — verified against the live database**, not just the repo. The Supabase
> management API is reachable now (`SUPABASE_ACCESS_TOKEN`), so the claims below have been
> checked rather than inferred. Two of them were wrong; both are corrected in place and marked
> **[verified 2026-09-16]**. Completion estimate against the spec is at the end of this file.

---

## 1. Intervention lifecycle — BUILT, SCHEMA NOT APPLIED

The core of the product. Five tables plus `INTERVENTION.Locked`, none of which existed; every
report depends on them. Full notes in **`intervention-lifecycle.md`**.

Shipped: the schema (`supabase/migrations/20260831_intervention_lifecycle.sql`); the
read/write path repointed off the dead `checklistactions` → `actions` catalog onto
`cl_action`; Create New (results + n measurements + notes, per pump group, filtered by
periodicity and `Pump_Type`); the header block (technicians, controller status, Ref_Month,
Verifyed_By / Responsable); Finalise existing as an editable variant of View existing, gated
on `Locked`; the two administrator emails on finalise; and the `Locked` print gate.

**⚠ The migration has still not been run — confirmed against the live DB [verified
2026-09-16].** `public` contains none of it:

```
interventions:  id, created_at, user_id, checklist_id, installation_id   <- 5 columns
absent tables:  int_result, int_notes, measurements,
                intervention_technicians, ctrl_status
```

Meanwhile `interventions.actions.ts` writes `int_result` / `measurements` / `int_notes` /
`intervention_technicians` and the header reads `ctrl_status`. So **New Intervention renders
but cannot save**, and the Controller status select is empty for the same reason. This is the
one blocking item in the file — paste the migration into the SQL editor.

Remaining: an end-to-end run against the real database, and a real PDF instead of the browser
print dialog (that is item 2, blocked on `FP25 - EQ0102 Rev7.pdf`).

---

## 2. PDF output

**Spec:** `reports-outputs.md`. Four list/blank reports (`REPORT#01` technicians, `#02` pump
groups, `#03` blank pump-group report, `#10` installations) plus the filled intervention PDF.

**Repo:** nothing. `package.json` has `react-to-print` (browser print dialog over a React tree,
used by `modules/Intervention/index.tsx`) but no PDF library and no server-side renderer.

**Why it is not a quick win:**

- Every report in the spec is a **save-to-file** flow — `[Input xLocation]`, then a "List
  generated. Save location:" pop-up. That is a file the user keeps, not a print dialog.
  `react-to-print` cannot produce one.
- `REPORT#02` and `#03` print ~25 `PUMP_GROUP` fields across six blocks, three of them
  conditional. **Blocked on item 3** — the data is not stored.
- `REPORT#03`'s check-list body is drawn as a literal `( . . . )` in the spec. **Blocked on the
  missing `FP25 - EQ0102 Rev7.pdf`** (index §2.0) for the actual row layout.
- The intervention PDF has no layout anywhere in the bundle, same blocker.

**Do first:** ask the client for `FP25 - EQ0102 Rev7.pdf`. `REPORT#01` (technicians) is the one
report that is unblocked today and is the natural pilot for whatever renderer we pick.

**Open:** `PUMP_GROUP.Condition` is `1`/`2` on p3 but `1`/`0` on sheets 5/6 and 6/6 — the report
prints the wrong word if we guess. `REPORT#01`'s CONDITION column reads
`TECHNICIAN_CUST:Certification` where it means `:Condition`.

---

## 3. `PUMP_GROUP` full field set

**Spec:** `data-model.md` § `PUMP_GROUP` — ~25 fields.

**Correction [verified 2026-09-16]: the `pumps` table already has the full field set.** All 26
columns are present — `sub_type`, `pump_{tag,brand,model,sn}`, `motor_{tag,brand,model,sn}`,
`ctrl_{tag,brand,model,type}`, `coupling_{brand,model,sn}`, `gearb_{brand,model,sn}`,
`column_length`, `nr_stages`, `condition`. **No migration is needed.** Only `code_customer` is
absent, and it is derivable through `installations.company_id`.

**Repo:** the gap is entirely UI/type-side. `types/pump.types.ts` exposes `id`,
`installation_id`, `type`, `sub_type`, `condition`; `NewPump.tsx` writes three fields. So this
item is now "build the six-block form over columns that exist", not a schema change.

**`Type` is a free-text `<Input>`** and has already produced junk: rows 2 and 3 hold
`type = "teste"`, which no `Pump_Type` filter can match, and `condition = "sss"` against a
1/0 domain. Both `Type` (J/E/D) and `Sub_Type` (H-ES/H-SC/VT/V-IL/VT-MS) are fixed domains and
belong in selects — do that even if the rest of the form waits.

- `Sub_Type` is unmodelled, so the `"H-ES"` → `"Horizontal End-Suction"` expansion the reports do
  has no source. Domain is on p3: `H-ES` / `H-SC` / `VT` / `V-IL` / `VT-MS`.
- The COUPLING / GEARBOX / VT PUMPS report blocks print only when their brand (or
  `Column_Lenght`) is non-empty — so these must be genuinely nullable, not empty-string.
- **`Ctrl_TAG` appears twice in the spec**, `S(8)` and `S(5)`. The second is probably `Ctrl_SN`.
  Confirm before writing the migration. **[?]**

Screens#13/#14 (new / edit pump group) lay out exactly these six blocks — build the form and the
columns together.

**Blocks item 2.** Also blocks any per-pump-group intervention report.

---

## 4. Soft-delete / condition flows

**Spec:** `screens-flows.md`.

| Flow | Spec behaviour | Repo |
| --- | --- | --- |
| Installation → Change Condition | `PopUp#28`: Active `1` / Exist but not Active `2` / Deleted `3` | missing |
| Pump group → Set Inactive | `[Set PUMP_GROUP:Condition = "0"]` | missing |
| Technician → Suspend | Action#19, `Condition = 2` | missing |

**Nothing in the spec ever deletes a row.** Every selector then filters on `Condition = 1`
(`PopUp#20`/`#21` for technicians), which is the half that is easy to forget: adding the column
without the filters gives you suspended technicians in every picker.

Note `REPORT#01` prints suspended technicians *with* their condition, so the list report must
**not** apply the filter — the pickers do, the report does not.

Resolve the `PUMP_GROUP.Condition` domain (`1`/`2` vs `1`/`0`) before writing this.

---

## 5. Registration and admin approval

**Spec:** `screens-flows.md` § Screen#02 / #04 / #03.

- **General conditions gate** — `[Display text from GENERAL CONDITIONS FILE]`, *Read* then
  *Accept*, which activates the *Send Required Registration* button. `modules/Auth/
  AccessConditions.tsx` exists; the file it should display, `FP25 RGPD Rev2` (index §1.1), **is
  not in the bundle**.
- **Admin approval** — Action#03 / #08 fill `Validated_By`, `Date_Validated`, `Condition = "1"`.
  No such columns and no admin screen.
- **Two emails** — `email1` on customer registration, `email2` on provider registration, both to
  the administrator. `#Emails.xlsx` has the TO/SUBJECT but the **body is a literal `....`**.
- **Access name rules** — minimum 10 characters, and "cannot be changed in the future".
  Uniqueness is checked live by Action#05 / #06.

**Blocked on the client** for the conditions file and the email bodies. The access-name rules and
the approval columns are not blocked.

**Also here:** *Delete Customer's Data* on the admin menu is drawn with **no action and no
target** — the only GDPR-shaped operation in the spec, and it is undefined. Ask together with the
RGPD file.

---

## 6. Send message — DONE, nothing to do

Checked 2026-08-31: this one is already built end to end and matches the spec.
`modules/Main/components/SendMessage.tsx` (single text field, Cancel / OK, i18n strings,
error toast) is rendered from `modules/Main/index.tsx`; it calls
`actions/clientActions/message.actions.ts` → `app/api/send-message/route.ts`, which emails
`ADMIN@FP25.com` via nodemailer. Kept in this list only so the next reader does not re-derive it.

**Open:** the spec's `ADMIN@FP25.com` differs from `#Emails.xlsx`'s `admin_FP25@equitotal.pt`.
One of them is a placeholder.

---

## 7. i18n from `Table_Field_Names.xlsx`

605 UI strings keyed by screen (`Screen#01` … ), columns `PT` / `EN` / `FR` / `ES`. `FR` and `ES`
are empty. This is the source `translations/languages/` should be generated from, and the `#`
column is the `ScreenField` number every drawing and `#Actions.xlsx` refers to — so importing it
also gives us a lookup from `SF#082` to the string it renders.

**Watch the key width.** This file uses 2-letter codes (`PT`/`EN`); every data file uses
3-letter (`PTG`/`ENG`), and `ENG`/`ENS`/`ENU` all mean "English" differing only by country.
`utils/specLanguage.ts` already maps one direction. Keep them separate: UI locale ≠ content
language.

Per `[[report-pump-use-i18n-translations]]`, UI strings go through i18next — so this is a
generation step into `translations/languages/`, not a runtime table.

---

## Known bugs found while surveying — all fixed 2026-08-31

Found while surveying, fixed as part of item 1 since that code was being rewritten anyway.
Recorded here because each was silently producing wrong data, not just wrong pixels. Details
in `intervention-lifecycle.md`.

1. **Answers landed on the wrong actions.** Toggles were named `action_${index}` with `index`
   restarting at 0 inside every group, then read back against the unfiltered, ungrouped action
   array. Fields are now keyed on the action's identity. ✅
2. **Every action was pre-answered.** `ExclusiveMultiToggleForm` defaulted to
   `options[0].value`, so an untouched intervention saved a full set of "Falha" answers nobody
   gave. `defaultValue` is now opt-in. ✅
3. **Period filter inverted.** `action.period >= period` kept the *less* frequent actions as the
   period code rose; PERIODICITY ascends most→least frequent, so a monthly round must include
   the weekly checks. `isDueForPeriod` tests `<=`. ✅
4. **Every period label was wrong.** `periodValues` was
   `["bianual","anual","trimester","semester","monthly","weekend"]` read by 0-based index,
   against a spec table that is 1-based and in the opposite order. Replaced with `PERIODICITY`
   + `periodLabel()`, the eight real codes, PT and EN. Still hardcoded — the rows belong in a
   `periodicity` table once Action#23 exists. ✅

---

## Done 2026-09-16

- **The pre-import `actions` catalog is gone.** `ActionsList` / `NewAction` / `useActions` /
  `actions.actions.ts` / `actions.mapper.ts` / `types/action.types.ts` deleted, the dead
  `checklistactions` branch stripped out of `checklists.mapper.ts`, and `ChecklistAction` /
  `ChecklistActionRaw` removed from `types/checklist.types.ts`. Actions are per-check-list
  imported data (Action#04) — the spec has no per-action CRUD screen anywhere.
  **The DB tables `actions`, `checklistactions` and `interventionchecklistactions` still
  exist** and were deliberately left: the last one holds pre-rework intervention results with
  no mapping onto `cl_action`. Drop them in a migration once item 1 is applied and you accept
  losing those rows.
- **The check-list tree now renders actions.** `ChecklistTree` stopped at sub-group level, so
  the Actions column said 9 with nothing behind it. It now nests group -> sub-group -> action
  with the periodicity, the NFPA-25 `source` clause, `Pump_Type` and the measurement-slot
  count. New i18n keys `checklists.noActions` / `pumpType` / `measurements`.
- **Analytics removed.** It appears nowhere in the spec — no analytics, dashboard, chart or
  statistics screen among the 14 screens / 43 pop-ups — and was already a dead `href="#"` with
  no route. Gone from `Navbar.tsx`, `constants/router.ts` and `middleware.ts`'s
  `protectedPaths`. **`recharts` is now an unused dependency.**
  `RouterKeys.SETTINGS` is the same case — non-spec, `href="#"`, no route, still guarded in
  `protectedPaths`. Left in place pending a decision.
- **Pump groups never reached the New Intervention selector.** `getPumps` resolved the raw
  Supabase rows without a mapper, so every pump arrived with `installation_id` and no
  `installationId`; the filter in `useNewIntervention.ts` compares
  `String(pump.installationId) === installationId` and therefore dropped every row the moment
  an installation was picked. The screen showed the spec's "There are no Pump Groups defined
  for this Installation!" while the group existed. Fixed with `mapPump` / `mapPumps`.

### Test-data note

The seed data is split across companies, which makes the app look more broken than it is:

| Company | Installations | Pump groups | Technicians |
| --- | --- | --- | --- |
| `8aedbce5…` (admin `pedrogilsenarego@gmail.com`) | 1 (Demo — Pump House) | 1 (`type E`) | **0** |
| `54c57a8c…` | 2 | 2 | 5 |

`useTechnicians` keys off the **logged-in user's** company, not the customer who owns the
selected installation. Under the spec those are the same thing — the logged-in user *is* the
customer — so this only surfaces because an admin can reach the intervention flow at all.

**Which is itself a deviation:** Interventions has no `WithRole` guard in `Navbar.tsx`, while
Installations and Pumps are `[CUSTOMER]` and Check-lists is `[ADMIN]`. Screen#03 (admin) has
five buttons — validate customer access, validate supplier access, delete customer's data,
check-list, logout — and no operational records at all. Gate it to `[CUSTOMER]`.

---

## Completion against the spec — estimate, 2026-09-16

Scored three ways, because any single count is misleading. **Partial = 0.5.**

**By the 31 numbered actions in `#Actions.xlsx`** — the spec's own implementation checklist:

| | Actions | |
| --- | --- | --- |
| Done | #04, #07 | check-list import + its validation |
| Partial | #01, #02, #03, #08, #15, #24 | i18n; login (Supabase, not the spec's own); customer/supplier approval without `Validated_By`/`Date_Validated`; technician create; pump-group create (3 fields of 25) |
| Missing | the other 23 | provider side #09–#13, technician CRUD #16–#19, every report #20/#21/#26–#31, the admin uploads #22/#23, pump-group edit #25, #05/#06/#14 |

**≈ 16%.** This badly undersells the work, because the whole intervention lifecycle —
Create / Finalise / View — is **unnumbered** in the spec and so scores nothing here.

**By data model** (~25 spec tables): the check-list tree (8 tables), `INSTALLATION`,
`PUMP_GROUP`, `CUSTOMER`/`SUPPLYER` (as `profiles`/`companies`), `TECHNICIAN_CUST` and
`INTERVENTION`'s header exist. Absent: `INT_RESULT`, `INT_NOTES`, `MEASUREMENTS`,
`TECHNICIAN_INT1/2`, `CTRL_STATUS`, `LANGUAGE`, `MAINT_TYPE`, `PERIODICITY`, `TECHNICIAN_SUP`,
`INST_RESPONSABLE` (partial as `responsables`). **≈ 60%** — and ≈ 45% by what is actually
*applied*, since item 1's five tables are written but not migrated.

**By user-facing capability** — what a customer can actually do end to end: log in, be
approved, manage installations, create a pump group, import a check-list, fill an
intervention. Cannot: finalise or view one (blocked on item 1), produce **any** of the five
PDFs, suspend/deactivate anything, manage provider technicians, or use the admin uploads.
**≈ 35%.**

**Overall: roughly one third of the spec, call it 30–40%.** The honest summary is that the
data-entry half is largely there and the **output half is absent** — the five PDFs are the
single largest block of unbuilt work, and the product exists to produce them.

Two caveats on that number:

1. **Applying item 1's migration moves it several points** for one paste. Nothing else has
   that ratio.
2. **The remaining third is not evenly available.** The intervention PDF and `REPORT#03`'s
   body are blocked on `FP25 - EQ0102 Rev7.pdf`, which is not in the bundle — so the largest
   missing piece cannot be started until the client sends it. Chase that before estimating a
   delivery date.
