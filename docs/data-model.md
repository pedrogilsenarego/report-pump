# FIREPUMP25 — Data Model (spec transcription)

Transcribed from Equitotal *FIREPUMP25* drawing `FP25-INFOLOG-R0`, rev 0 dated 2023.04.13
(revision block: `0 | 2024.07.17 | Emmission for enquiry | RV`). Written 2026-08-07.

Source pages in `app/assets/`:

| File | Sheet | Title |
| --- | --- | --- |
| `FP25-INFOLOG-R1-p1.pdf` | 1/6 | Legend of Data Base Structure |
| `FP25-INFOLOG-R1-p2.pdf` | 2/6 | Data-base organization |
| `FP25-INFOLOG-R1-p3.pdf` | 3/6 | System Tables / Operational Data Tables / Fixed values of Fields |
| `FP25-INFOLOG-R1-Menus1.pdf` | 4/6 | Menus — admin / service provider (Action#04 slice in `checklist-actions-import.md`; everything else in `screens-flows.md`) |
| `FP25-INFOLOG-R1-Menus2.pdf` | 5/6 | Menus — customer (`screens-flows.md`) |
| `FP25-INFOLOG-R1-Outputs.pdf` | 6/6 | Outputs — **transcribed 2026-08-31** in `reports-outputs.md` |

These are CAD drawings. Their PDF text layer comes out unordered, so this file is a
reconstruction from the rendered pages. Where the drawing was genuinely ambiguous it is marked
**[?]** rather than guessed.

## Notation (p1)

| Type | Meaning |
| --- | --- |
| `I(n)` | Integer, `n` digits |
| `N(n.m)` | Numeric, `n` integer digits, `m` decimals |
| `S(n)` | String, `n` characters |
| `D` | Date, format `yyyy.mm.dd` |
| `IMG` | Image |
| `x(n)*` | Pre-set values — see the fixed-values table on p3 |

- `*` prefix on a field name = part of the primary key.
- `*` suffix = mandatory.
- `**` suffix = mandatory, chosen from a table of values.
- Table marked **`S`** = *System Table*, loaded from an external Text/Excel file via
  Administrator / Maintenance.
- Table marked **`D`** = *Operational Data Table*, same loading mechanism.

**Composite key convention.** A child table's key is its own `Code` *plus every ancestor's
code*. p1 states it directly: `Code of each occurance of TAB_C is composed of its code + Code
of TAB_B + Code of TAB_A`. This is why `CL_ACTION` carries `Code_Cl_Sub_Gr`, `Code_Cl_Gr` *and*
`Code_Check_List`, and why `MEASUREMENTS` carries a nine-column key. Codes are only unique
within their parent.

## Actors and assets

### `LANGUAGE` (S)
`*Code S(3)` · `Name S(15)` · `Country S(15)` · `Flag IMG`

Loaded by **Action#22** from `Table_Language.xlsx`. `Code` is the 3-letter language key used by
every `Language` field in the model — `PTG`, `ENG`, `ENS`, `ENU`, `FRA`, `ESP`, `GER`.
`Flag` is a filename (`Flag_PTG.jpg`), which resolves the `{??}` p3 shows for this field.

### `CUSTOMER`
`*Code I` · `Name* S(99)` · `Address1* S(99)` · `Address2 S(99)` · `Address3 S(99)` ·
`Country S(99)` · `Name_Responsable1* S(99)` · `Phone S(15)` · `Email* S(99)` ·
`Language** S(3)` · `Acces_Name* S(15)` · `Validated_By S(2)` · `Date_Validated S(2)` ·
`Condition I(1)`

`Validated_By` / `Date_Validated` are typed `S(2)` in the drawing; `Date_Validated` being a
string rather than `D` looks like a slip. **[?]**

### `CONTRACTOR`
`*Code I` · `Name* S(99)` · `Address1* S(99)` · `Address2 S(99)` · `Address3 S(99)` ·
`Country S(99)` · `Name_Responsable1* S(99)` · `Phone S(15)` · `Email* S(99)` · `Language** S(3)`

### `SUPPLYER`
Same fields as `CONTRACTOR`, plus `Condition I(1)`.
(The spec spells this `SUPPLYER` here and `SUPPLIER` elsewhere.)

### `ADMIN`
`*Code S(2)` · `Name S(10)`

### `TECHNICIAN_CUST`
`*Code I` · `*Code_Customer I` · `Language S(2)` · `Name* S(20)` · `Function S(99)` ·
`Phone S(15)` · `Email S(30)` · `Certification S(99)` · `Condition I(1)*`

### `TECHNICIAN_SUP`
`*Code I` · `*Code_Supplyer I` · `Name* S(20)` · `Function S(99)` · `Phone S(15)` ·
`Email S(30)` · `Certification S(99)` · `Condition I(1)`

Note `Language` is `S(2)` on the technician tables but `S(3)` everywhere else — inconsistent
with `LANGUAGE.Code S(3)`. Treat as `S(3)`.

### `INSTALLATION`
`*Code I` · `*Code_Customer I` · `Name* S(99)` · `Area S(99)` · `Responsable I` ·
`Address1* S(99)` · `Address2 S(15)` · `Address3 S(99)` · `Language* S(3)` ·
`Phone S(15)` · `Email* S(30)` · `Condition I(1)*`

`Responsable` is an FK into `INST_RESPONSABLE`. `Address2 S(15)` is narrower than
`Address1`/`Address3` at `S(99)` — probably a slip. **[?]**

### `INST_RESPONSABLE`
`*Code I` · `Name* S(20)` · `Language S(2)` · `Address1* S(99)` · `Phone S(15)` ·
`Email S(30)` · `Date_In D` · `Date_Out D` · `Condition I(1)*`

Added in Rev1 — not present in the older `Spec*.pdf` set.

### `PUMP_GROUP`
`*Code I` · `*Code_Inst I` · `*Code_Customer I` · `Type* S(1)*` · `Sub_Type S(5)*` ·
`Pump_TAG S(8)` · `Pump_Brand* S(15)` · `Pump_Model* S(10)` · `Pump_SN* S(20)` ·
`Motor_TAG S(8)` · `Motor_Brand* S(15)` · `Motor_Model S(10)` · `Motor_SN* S(20)` ·
`Ctrl_TAG S(8)` · `Ctrl_Brand* S(15)` · `Ctrl_Model S(10)` · `Ctrl_TAG S(5)` ·
`Ctrl_Type S(5)` · `Coupling_Brand S(15)` · `Coupling_Model S(10)` · `Coupling_SN S(20)` ·
`GearB_Brand S(15)` · `GearB_Model S(10)` · `GearB_SN S(20)` · `Column_Lenght S(10)` ·
`Nr_Stages I(2)` · `Condition I(1)`

`Ctrl_TAG` appears **twice**, as `S(8)` and `S(5)`. The second is probably `Ctrl_SN` or
similar. Needs confirming with the client. **[?]**

## Check-list template

This is the part that matters for the import. **Groups and sub-groups are scoped to a
check-list, not global** — `CL_GR` hangs off `CHECK_LIST`, and group `1` of check-list `7` is a
different row from group `1` of check-list `8`.

```
CHECK_LIST
  └── CL_GR ────────────────── CL_GR_TEXT        (D)
        └── CL_SUB_GR ───────── CL_SUBGR_TEXT    (D)
              └── CL_ACTION ─── CL_ACTION_TEXT   (D)
                    └── CL_ACTION_VALUES ─── CL_VALUES_TEXT  (D)
```

### `CHECK_LIST`
`*Code I` · `Name* S(20)` *[Rev1]* · `Date* D` · `NFPA_Ed* S(4)` · `Company_Resp* S(50)` ·
`Name_Resp* S(20)` · `Phone S(15)` · `Email* S(30)`

### `CL_GR`
`*Code I` · `Code_Check_List I`

### `CL_SUB_GR`
`*Code I` · `Code_Cl_Gr I` · `Code_Check_List I`

### `CL_ACTION`
`*Code I` · `Code_Cl_Sub_Gr I` · `Code_Cl_Gr I` · `Code_Check_List I` ·
`Period* S(1)*` · `Pump_Type* S(1)*`

### `CL_ACTION_VALUES`
`*Code I` · `Code_Cl_Action I` · `Code_Cl_Sub_Gr I` · `Code_Cl_Gr I` · `Code_Check_List I`

One row per measurement slot on an action. `Code` is the `INDEX` column of
`Form4_Measurements.xlsx` — an action with three readings (e.g. RPM after start / 10 min /
15 min) gets three rows.

### The `_TEXT` tables

**Names are not columns on the structure tables.** Every display string lives in a sibling
`_TEXT` table with **one row per language**:

| Table | Fields |
| --- | --- |
| `CL_GR_TEXT` (D) | `*Code I` · `Code_CL_Gr I` · `Code_CL I` · `Language S(3)` · `Text S(50)` |
| `CL_SUBGR_TEXT` (D) | `*Code I` · `CL_SubGr_Code I` · `CL_Gr_Code I` · `CL_Code I` · `Language S(3)` · `Text S(50)` |
| `CL_ACTION_TEXT` (D) | `*Code I` · `CL_Action_Code I` · `CL_SubGr_Code I` · `CL_Gr_Code I` · `CL_Code I` · `Language S(3)` · `Type S(5)` · `Source S(50)` · `Text S(50)` |
| `CL_VALUES_TEXT` (D) | `*Code I` · `CL_Values_Code I` · `CL_Action_Code I` · `CL_SubGr_Code I` · `CL_Gr_Code I` · `CL_Code I` · `Language S(3)` · `Text S(50)` |

`CL_ACTION_TEXT` carries two extra per-language fields beyond the name:

- `Type S(5)` — the localized group abbreviation (`IPE` in PTG, `PTI` in ENG).
- `Source S(50)` — the NFPA-25 clause the action comes from (`8.2.2(1)(a/b)`), or
  `Instruções do Fabricante` / `Mnfct instructions` when it is a manufacturer requirement.

`Text S(50)` is **too short for the real data**: the longest `NAME1` in `Form3_Actions.xlsx`
runs 96 characters (`Pressão no manómetro da sucção bomba é normal` is fine, but
`Procedures of Inspection (I), Verifications (V), Replacements (R), Cleaning (C) and Test (T)`
in `Form1_Groups.xlsx` is 91). Do not enforce `S(50)`.

## Intervention (report execution)

### `INTERVENTION`
`*Code I` · `*Code_Pump_Gr I` · `*Code_Inst I` · `*Code_Customer I` · `Date_Start* D` ·
`Date_End* D` · `Ref_Month S(10)` · `Process_Ref S(10)` · `Language* S(3)` · `Period S(1)` ·
`Controler_Status** S(1)*` · `Verifyed_By* S(10)` · `Responsable* S(20)` · `Date_Report D` ·
`Locked I(1)*`

`Verifyed_By` and `Responsable` carry note `[1]`: *this field must have one occurence from
tables `TECHNICIAN_INT1` or `TECHNICIAN_INT2`*.

### `TECHNICIAN_INT1` / `TECHNICIAN_INT2`
`*Code I` · `*Code_Intervention I` · `*Code_Pump_Gr I` · `*Code_Inst I` ·
`*Code_Customer1 I` · `*Code_Tech_Cust I` · `*Code_Customer2 I`

Two identical tables — presumably "first technician" / "second technician" on an
intervention. Why this is two tables rather than one with a slot number is unexplained. **[?]**

### `INT_RESULT`
`*Code I` · `Code_Intervention I` · `Code_Pump_Gr I` · `Code_Inst I` · `Code_Customer I` ·
`Code_Cl_Action I` · `Code_Cl_Sub_Gr I` · `Code_Cl_Gr I` · `Code_Check_List I` · `Result** S(1)`

The pass/fail answer for one action on one intervention. `Result` ∈ `V` (Ok) / `X` (Fail) /
`-` (See notes).

### `INT_NOTES`
`*Code I` · `Code_Intervention I` · `Code_Pump_Gr I` · `Code_Inst I` · `Code_Customer I` ·
`Code_Interv_Result I` · `Text S(99)`

Free text hanging off an `INT_RESULT` — the "See notes" case.

### `MEASUREMENTS`
`*Code I` · `Code_Intervention I` · `Code_Pump_Gr I` · `Code_Inst I` · `Code_Customer I` ·
`Code_Cl_Action I` · `Code_Cl_Sub_Gr I` · `Code_Cl_Gr I` · `Code_Check_List I` ·
`Code_Cl_Action_Values I` · `Value N(6.1)`

The numeric reading for one `CL_ACTION_VALUES` slot. `N(6.1)` = up to 6 integer digits,
1 decimal.

## Lookup tables

| Table | Kind | Fields | Loaded by | From |
| --- | --- | --- | --- | --- |
| `LANGUAGE` | S | `*Code S(3)` · `Name S(15)` · `Country S(15)` · `Flag IMG` | Action#22 | `Table_Language.xlsx` |
| `MAINT_TYPE` | S | `*Code` · `Language` · `Name` | Action#23 | `Table_Peridiocity.xlsx` |
| `PERIODICITY` | S | `*Code I` · `Language S(3)` · `Text S(10)` | Action#04 | `Table_Peridiocity.xlsx` |
| `CTRL_STATUS` | D | `*Code S(2)` · `Language S(3)` · `Name S(10)` | Action#04 | `Table_Ctrl_Status.xlsx` |

`MAINT_TYPE` and `PERIODICITY` are two tables loaded from the same file with the same shape.
Whether they are genuinely distinct concepts or a modelling duplication is unclear. **[?]**

## Pre-set values (p3)

| Table | Field | Code | Meaning |
| --- | --- | --- | --- |
| `PUMP_GROUP` | `Type` | `J` | Jockey (+ Pump Room) |
| | | `E` | Electric Driven Pump |
| | | `D` | Diesel Driven Pump |
| `PUMP_GROUP` | `Sub_Type` | `H-ES` | Horizontal End-Suction |
| | | `H-SC` | Horizontal Split Case |
| | | `VT` | Vertical |
| | | `V-IL` | Vertical In-Line |
| | | `VT-MS` | Vertical Multi-Stage |
| `PUMP_GROUP` | `Condition` | `1` / `2` | Active / Inactive — **contradicted by sheets 5/6 and 6/6, which both say `1`/`0`; see `reports-outputs.md`** |
| `TECHNICIAN_CUST` | `Condition` | `1` / `2` | Active / Inactive |
| `INST_RESPONSABLE` | `Condition` | `1` / `2` | Active / Inactive |
| `INSTALLATION` | `Condition` | `1` / `2` / `3` | Active / Exist but not active / Deleted |
| `INTERVENTION` | `Controler_Status` | `A` / `M` / `0` | Automatic / Manual / Off |
| `INTERVENTION` | `Locked` | `1` / `2` | Not Locked / Locked |
| `INT_RESULT` | `Result` | `V` / `X` / `-` | Ok / Fail / See notes — **sheet 5/6 uses a fourth value `*` that is not in this table**; see `screens-flows.md` |

`CL_ACTION.Pump_Type* S(1)*` is pre-set but has no entry of its own in the p3 table. It is
almost certainly the `PUMP_GROUP.Type` domain (`J`/`E`/`D`) — i.e. which pump kinds an action
applies to. **Sheet 5/6 supports this**: *Print Blank* defines `xType = PUMP_GROUP:Type` right
before calling Action#28, and Action#28's report is the one that loops `CL_ACTION`. So one
check-list template does cover all pump types with per-action filtering. What is still open is
the **four-vs-three mismatch** with `#Tipos Sub-Grupo NP.xlsx` (`Sala SI` / `Jockey` /
`B.Elétrica` / `B.Diesel`). **[?]** See `screens-flows.md`.

**Conflict:** p3's pre-set table gives `Controler_Status` as `A`/`M`/`0`, but
`Table_Ctrl_Status.xlsx` keys the same three meanings as `1`/`2`/`3`. The xlsx is the loaded
artifact, so it probably wins, but this needs confirming.

## Conflicts with the current implementation

The model above disagrees with what is already in the repo:

1. **`groups` / `subgroups` are global; the spec's are per-check-list.**
   `supabase/migrations/20260805_groups_subgroups.sql` creates `groups (code unique)` and
   `subgroups (code_group, code)` with no check-list column. The spec keys them
   `(Code, Code_Check_List)` and `(Code, Code_Cl_Gr, Code_Check_List)`. `Form1_Groups.xlsx`
   proves this is load-bearing: it ships groups 1–4 twice, once for `CHECK-LIST=1` and once
   for `CHECK-LIST=2`, with different names for group 4 in each
   (`Ensaio / Teste de caudal (T)` vs `Ensaios e Teste de caudal (T)`). A global unique
   `code` cannot represent that.

2. **Names are `jsonb` columns; the spec uses row-per-language `_TEXT` tables.** Either shape
   can store the data. The `jsonb` approach is less code, but diverges from the spec, and the
   spec's `CL_ACTION_TEXT` also varies `Type` and `Source` per language, which a single
   `name jsonb` column does not cover.

3. **Language keys are `en`/`pt`; the spec's are `ENG`/`PTG`.** The seed in that migration
   writes `{"en": ..., "pt": ...}`; every Form file writes `ENG`/`PTG`. A boundary mapping is
   needed either way, since the app's i18n (`translations/languages/`) uses the 2-letter form.

4. **`is_admin()`-gated writes assume Action#22 owns this data.** Per p3, groups/sub-groups/
   actions are written by **Action#04**, which runs from the New Check-List popup — not from
   the Administrator menu. The RLS policy would block a non-admin service provider from
   creating a check-list.

The migration has not been run yet, so this is a cheap moment to resolve (1)–(4). See
`checklist-actions-import.md` for the decision and the open client questions.
