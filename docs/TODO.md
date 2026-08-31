# FIREPUMP25 — Backlog

Derived from the full spec transcription (`data-model.md`, `spec-inputs.md`, `screens-flows.md`,
`reports-outputs.md`) against the repo, 2026-08-31. Ordered by how much else depends on it.

**(1) the intervention lifecycle is built** — see `intervention-lifecycle.md`. Its migration
still has to be run. Everything below it is registered, not started.

---

## 1. Intervention lifecycle — BUILT

The core of the product. Five tables plus `INTERVENTION.Locked`, none of which existed; every
report depends on them. Full notes in **`intervention-lifecycle.md`**.

Shipped: the schema (`supabase/migrations/20260831_intervention_lifecycle.sql`); the
read/write path repointed off the dead `checklistactions` → `actions` catalog onto
`cl_action`; Create New (results + n measurements + notes, per pump group, filtered by
periodicity and `Pump_Type`); the header block (technicians, controller status, Ref_Month,
Verifyed_By / Responsable); Finalise existing as an editable variant of View existing, gated
on `Locked`; the two administrator emails on finalise; and the `Locked` print gate.

**⚠ The migration has not been run** — no Supabase CLI is linked and the Supabase MCP server
timed out. Paste it into the SQL editor; nothing in this item works until then.

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

**Repo:** `types/pump.types.ts` has four: `id`, `installation_id`, `type`, `condition`.

Missing: `code_customer`, `sub_type`, and the whole component block —
`pump_{tag,brand,model,sn}`, `motor_{tag,brand,model,sn}`, `ctrl_{tag,brand,model,type}`,
`coupling_{brand,model,sn}`, `gearb_{brand,model,sn}`, `column_lenght`, `nr_stages`.

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
