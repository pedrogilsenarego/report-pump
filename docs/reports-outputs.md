# FIREPUMP25 — Outputs / Reports Layout (spec transcription)

Transcription of `app/assets/FP25-INFOLOG-R1-Outputs.pdf`, sheet **6/6** of the Equitotal
drawing set — index §7 *Reports Layout*. Written 2026-08-31. This sheet was listed as
*"not yet transcribed"* in `data-model.md` until now.

The report-generating **actions** (#20/#21, #26/#27, #28/#29, #30/#31) live on sheet 5/6 and are
transcribed in `screens-flows.md`; this file is the page layout each one produces.

> **How this was read.** The drawings have no usable text-extraction tooling on this machine
> (`pdftoppm` is not installed, and there is no PDF library in `package.json`). The text layer
> was recovered by inflating the PDF content streams and replaying the text-positioning
> operators, then re-flowing items by `(y, x)`. Font glyph ids are the CID minus 29 for ASCII.
> The reusable scripts are throwaway — rebuild them if a page needs re-reading.

## What is on the sheet

Three report layouts, drawn twice on the page (the drawing repeats itself; the two halves are
identical):

| Report | Title on the page | Produced by |
| --- | --- | --- |
| `REPORT#01` | LIST OF TECHNICIANS / CUSTOMER | Action#20 (generate), Action#21 (save) |
| `REPORT#02` | LIST OF PUMP GROUPS **POR** CUSTOMER *(sic — PT for "by")* | Action#26, Action#27 |
| `REPORT#03` | PUMP GROUP / BLANK REPORT | Action#28, Action#29 |

**`REPORT#10`** (list of installations) is referenced by Action#30/#31 on sheet 5/6 but has **no
layout on this sheet** — it is specified inline there as *"All fields from `table.INSTALLATION`
with `INSTALLATION:Code_Customer = CUSTOMER:Code`"*.

**The filled-in intervention report — the thing the whole app exists to produce — is not on this
sheet either.** Screen#09 → REPORTS → *Print (PDF)* only says *"Generate PDF
`table.INTERVENTION.Code`, with all fields from `INT_NOTES` / `INT_RESULT` / `MEASUREMENTS` /
`TECHNICIAN_INT1` / `TECHNICIAN_INT2` / `CTRL_STATUS`"*. Its layout is `FP25 - EQ0102 Rev7.pdf`
(index §2.0), which **is not in the bundle**. See "Still missing" below.

## Page furniture (all three reports)

Header band, top-left:

```
(Equitotal logo)  FIREPUMP25 (TM)
                  Fire Pump Maintenance Program (Rev.02)
                  [REPORT#nn]
```

Footer band, bottom-right:

```
Equitotal (TM)
FIREPUMP25   Serviços e Equipamentos Técnico Industriais, Lda.
             Ph.: +351.212742823     PORTUGAL
             geral@equitotal.pt
```

Note the drawing labels the `REPORT#03` block's header `[REPORT#02]` — a copy-paste slip; the
title bar of the same block reads `PUMP GROUP / BLANK REPORT` and the callout box says
`[ REPORT#03 ]`.

## `REPORT#01` — List of technicians

Title line — `[ScreenField#335]` / `#336` / `#337`:

```
Customer: table.CUSTOMER:Name  |  LIST OF TECHNICIANS / CUSTOMER  |  Date: [System.Date]
```

Column headers — `SF#338`–`SF#344`:

```
NAME | FUNCTION | PHONE | EMAIL | LANG. | CERTIFICATION | CONDITION
```

Body:

```
Select all records from table.TECHNICIAN_CUST
  with TECHNICIAN_CUST.code = CUSTOMER.Code

  Print table.TECHNICIAN_CUST:Name
  Print table.TECHNICIAN_CUST:Function
  Print table.TECHNICIAN_CUST:Phone
  Print table.TECHNICIAN_CUST:Email
  Print table.TECHNICIAN_CUST:Language
  Print table.TECHNICIAN_CUST:Certification
  [SF#345] Print "Active"    if table.TECHNICIAN_CUST:Certification = 1 ;
                 "Suspended" if table.TECHNICIAN_CUST:Certification = 2
  [SF#346]
```

**Spec bug.** The CONDITION column reads `TECHNICIAN_CUST:Certification`, but `Certification` is
the free-text `S(99)` qualification field and is already printed in the previous column.
`Condition I(1)` is the field with the `1`/`2` = Active/Inactive domain (`data-model.md`), and
Action#19 soft-deletes a technician by setting `Condition = 2`. **Read this as `:Condition`.**
Note also that the drawing prints `"Suspended"` where p3's pre-set table says `Inactive` — the
customer menu's button is labelled *Suspend*, so `Suspended` is the display string. **[?]**

`TECHNICIAN_CUST.code = CUSTOMER.Code` is likewise a slip for `Code_Customer` — `Code` is the
technician's own key.

## `REPORT#02` — List of pump groups by customer

Title `[ScreenField#490]`. Two nested loops:

```
For all INSTALLATIONS:Code_Customer = CUSTOMER:Code
  For all PUMP_GROUP:Code_Inst = INSTALLATIONS:Code AND PUMP_GROUP:Code_Customer = CUSTOMER:Code
    Print: ...
  Next PUMP_GROUP:Code
Next INSTALLATION:Code
```

Per-group header — `SF#491` / `#492` / `#493`:

```
Customer: table.CUSTOMER:Name  |  Installation: table.INSTALLATION:Name  |  Date: [System.Date]
```

Then one block per component. **The last three blocks are conditional** — they print only when
the corresponding brand / length field is non-empty, so a report is not a fixed-height form:

| Block | Field row | Screen fields | Printed when |
| --- | --- | --- | --- |
| `[SF#495]` **PUMP** | `Type (J/E/D)` · `Sub_Type` · `TAG` · `Cond.` | `#496`–`#499` | always |
| | `Brand` · `Model (*)` · `S/N` | `#500`–`#502` | |
| `[SF#505]` **MOTOR / ENGINE** | `Brand` · `Model` · `TAG` · `S/N` | `#506`–`#509` | always |
| `[SF#512]` **CONTROLLER** | `Brand` · `Model` · `TYPE` · `TAG` · `S/N` | `#513`–`#517` | always |
| `[SF#520]` **COUPLING** | `Brand` · `Model` · `S/N` | `#521`–`#523` | `If PUMP_GROUP:Coupling_Brand <> ""` |
| `[SF#525]` **GEARBOX** | `Brand` · `Model` · `SN` | `#526`–`#528` | `If PUMP_GROUP:GearB_Brand <> ""` |
| `[SF#530]` **VT PUMPS** | `Column Lenght` · `Nr. of Stages` | `#531`, `#532` | `If PUMP_GROUP:Column_Lenght <> ""` |

Two fields are printed **expanded from their code**, not raw:

```
Sub_Type:  "Horizontal End-Suction" IF PUMP_GROUP.Sub_Type = "H-ES",
           "Horizontal Split-Case"  IF PUMP_GROUP.Sub_Type = "H-SC",  ....   [See PRE-SET VALUES]

Cond.:     "Active"   IF PUMP_GROUP.Condition = "1",
           "Inactive" IF PUMP_GROUP.Condition = "0"                          [See PRE-SET VALUES]
```

**Conflict — `PUMP_GROUP.Condition` has three different domains across the spec:**

| Source | Values |
| --- | --- |
| p3 pre-set table (`data-model.md`) | `1` / `2` = Active / Inactive |
| This report | `1` / `0` = Active / Inactive |
| Sheet 5/6, *Set Inactive (Pump Group)* | `[Set PUMP_GROUP:Condition = "0"]` |

Two of the three say `0`, so `0` is probably right and p3's `2` is the copy-paste (every other
`Condition` field in the model really is `1`/`2`). **Needs confirming** — this is a live
correctness question, not a cosmetic one: the customer menu filters on it.

## `REPORT#03` — Pump group / blank report

The paper form a technician fills in by hand. Title `[ScreenField#555]`.

```
Select PUMP_GROUP:Code = xCode
   AND PUMP_GROUP:Code_Inst = xInstallation
   AND PUMP_GROUP:Code_Customer = CUSTOMER:Code
Print: ...
```

`xCode` / `xInstallation` come from the PopUp#36–#39 selection chain on sheet 5/6.

Header `SF#556`–`#558` and the six equipment blocks are **identical to `REPORT#02`**, renumbered
`SF#560`–`#597`, same conditional rules on COUPLING / GEARBOX / VT PUMPS.

Below the equipment blocks, the check-list body:

```
For all table.CL_ACTION:Code_Check_List = xLast_Check_List
    Print CL_GR_TEXT:Text  WITH  CL_GR_TEXT:Code = CL_ACTION:Code_Cl_Gr  AND
    ( . . . )

    Select ALL records from table.INT_NOTES WHERE:
        table.INT_NOTES:Code_Intervention = table.INTERVENTION:code
    AND table.INT_NOTES:Code_Pump_Gr     = table.PUMP_GROUP:Code
    AND table.INT_NOTES:Code_Inst        = table.INSTALLATION:Code
    AND table.INT_NOTES:Code_Customer    = table.CUSTOMER:Code
        OR
        table.INT_NOTES:Code_Interv_Result = table.INT_RESULT:Code
    ( . . . )
Next PUMP_GROUP:Code
```

`( . . . )` is **literal in the drawing** — the spec abbreviates the group / sub-group / action
nesting and the row layout rather than drawing it. So sheet 6/6 does *not* tell us what a
check-list row looks like on paper. That detail is only in the missing `FP25 - EQ0102 Rev7.pdf`.

Two things it *does* settle:

1. **`xLast_Check_List` is the check-list template the report uses**, and sheet 4/6 defines it at
   **login**, for every user, right after the username is found:
   ```
   Define variable xLast_Check_List = BIGGEST (table.CHECL_LIST:Code)   [sic — CHECL_LIST]
   ```
   So the template is **never chosen by the user — it is always the highest `CHECK_LIST:Code`**.
   That answers half of open question 7 in `checklist-actions-import.md`: nothing picks between
   check-list 1 and 2; the newest import wins globally. It also means **importing a new
   check-list silently re-points every future blank report**, which is worth flagging to the
   client.

2. The `INT_NOTES` selection is what merges *"Include Notes from previous Report?"*
   (PopUp#40, `xNotes`) into a blank form. The `OR` arm picks up notes attached to a specific
   `INT_RESULT`; the `AND` arm picks up the free-standing ones Action#25 writes with
   `Code_Interv_Result = 0`.

## Gap against the current implementation

Nothing on this sheet exists in the repo. Concretely:

- **No PDF generation at all.** `package.json` has `react-to-print` (browser print of a React
  tree) but no PDF library and no server-side renderer. Every one of REPORT#01/#02/#03/#10 and
  the intervention PDF is a save-to-file flow (`[Input xLocation]`), not a browser print dialog.
- **No report routes or actions.** Nothing in `app/` or `actions/` produces any of them.
- **`PUMP_GROUP` is far thinner than the report needs.** `types/pump.types.ts` carries
  `id / installation_id / type / condition`. `REPORT#02` prints ~25 fields —
  pump/motor/controller/coupling/gearbox brand, model, S/N, TAG, plus `Column_Lenght` and
  `Nr_Stages`. The three conditional blocks cannot be driven at all from what is stored.
- **`Sub_Type` is not modelled**, so the `"H-ES"` → `"Horizontal End-Suction"` expansion has no
  source. Same for the `CTRL_STATUS` lookup the intervention PDF needs.
- **`INT_NOTES`, `INT_RESULT` and `MEASUREMENTS` do not exist** — no table, no type, no code
  path. The intervention side currently stores one `value` per action row in
  `interventionchecklistactions`, with nowhere to put a note or a numeric reading.
- **`INTERVENTION.Locked` does not exist**, and it gates printing (*"Report not Locked; cannot be
  printed"*).
- **`TECHNICIAN_INT1` / `TECHNICIAN_INT2` do not exist** — an intervention has no technicians
  attached, but the PDF prints them.

## Still missing from the client (report-specific)

1. **`FP25 - EQ0102 Rev7.pdf`** — index §2.0, the *basic report*. This is the actual layout of
   the filled and blank check-list pages that `( . . . )` stands in for, and it is the single
   most valuable missing document: without it the intervention PDF cannot be laid out.
2. **`REPORT#10` has no drawn layout** — only the one-line spec on sheet 5/6.
3. **Confirm `PUMP_GROUP.Condition`** — `1`/`2` (p3) or `1`/`0` (this sheet + sheet 5/6).
4. **Confirm `TECHNICIAN_CUST` CONDITION column** reads `:Condition`, not `:Certification`.
5. **Confirm the `xLast_Check_List` rule** is really intended — a new check-list import changing
   every customer's blank report is a large side effect for an admin action with no warning.
