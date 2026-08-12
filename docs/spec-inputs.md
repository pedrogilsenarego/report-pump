# FIREPUMP25 — Spec Input Files (extracted)

The client's spec bundle landed in `app/assets/` on 2026-08-07. This file records the contents
of the `.xlsx` files, because **the Read tool cannot open xlsx** — every access otherwise needs
a throwaway unzip-and-parse script. The drawings (`.pdf`) can be read directly on demand; their
data model is transcribed in `data-model.md`.

To re-extract: an `.xlsx` is a zip of XML. Unzip into a scratch dir, then parse
`xl/sharedStrings.xml` + `xl/worksheets/sheet*.xml`. No `xlsx` dependency was added to
`package.json` for this — the spec files are read-time artifacts, not runtime ones. (A parser
*will* be needed at runtime for Action#04; that's a separate decision.)

## Manifest

`#00 FP25 Index Dev_File R1.xlsx` is the authoritative index of the whole spec:

| § | Description | File |
| --- | --- | --- |
| 1.1 | User Agreement | `FP25 RGPD Rev2` **(missing)** |
| 1.2 | List of communications Emails | `#Emails.xlsx` |
| 2.0 | Basic report | `FP25 - EQ0102 Rev7.pdf` **(missing)** |
| 2.1 | General organization of Sub-Groups | `#Tipos Sub-Grupo NP.xlsx` |
| 2.2 | Names of Groups (Input table) | `Form1_Groups.xlsx` |
| 2.3 | Names of Sub-Groups (Input table) | `Form2_Sub_Groups.xlsx` |
| 2.4 | Names of Groups (Input table) *[sic — Actions]* | `Form3_Actions.xlsx` |
| 2.5 | Names of Measurements by Group (Input table) | `Form4_Measurements.xlsx` |
| 3.1 | Names of Languages (Input table) | `Table_Language.xlsx` |
| 3.2 | Names of Periodicities (Input table) | `Table_Peridiocity.xlsx` |
| 3.3 | Names of final Controller Status (Input table) | `Table_Ctrl_Status.xlsx` |
| 3.4 | System Tables | dwg p3 |
| 4.1 | Legend of Data-base design | dwg p1 |
| 4.2 | Data-Base design | dwg p2 |
| 5.1 | List of Screens (Menus) | `#Screens_Pop-ups List.xlsx` sheet 1 |
| 5.2 | List of Pop-Ups (Menus) | `#Screens_Pop-ups List.xlsx` sheet 2 |
| 5.3 | List of Actions | `#Actions.xlsx` |
| 6.1 | List of Field names | `Table_Field_Names.xlsx` |
| 6.2 / 6.3 | Menus Layout | dwg p4 / p5 |
| 7. | Reports Layout | dwg p6 (`-Outputs.pdf`) |

Two referenced documents are **not in the bundle**: the RGPD user agreement and
`FP25 - EQ0102 Rev7.pdf`, the *basic report* — i.e. the paper form the whole app reproduces.
Worth asking for; it is likely the clearest statement of what the output should look like.

The index names the drawing `FP25-INFOLOG-R0.dwg` while the PDFs are named `-R1`. The revision
block inside p1 reads `0 | 2024.07.17 | Emmission for enquiry`, and p2 carries a `Name* [Rev1]`
annotation on `CHECK_LIST`, so the PDFs are R0 content with scattered R1 edits.

## Common shape of the Form / Table files

All four `Form*.xlsx` share one layout:

- Rows 1–3: header block (company, file name, page name, date `2023.12.12`).
- **Row 6**: human-readable column labels.
- **Row 7**: the `[A]`…`[N]` column keys that p3's mapping table refers to.
- **Row 9 onward**: data. Trailing rows contain a `CODE` value only — empty templates, skip them.
- Left block: identity columns. Right of it, a **repeating per-language block** (p3 calls each
  one a `Cycle`). Stride is 2 columns, except `Form3` where it is 4.

`[A] CODE` is a flat sequential surrogate key, unique across the whole file. The real identity
is the `(CHECK-LIST, GROUP, SUB-GROUP, ACTION, INDEX)` tuple — matching the composite-key
convention in `data-model.md`. A parser should read the left block, then stride right until the
columns run out; **do not hardcode two languages.**

## `Form1_Groups.xlsx` → `CL_GR` + `CL_GR_TEXT`

Header `TABLE OF NAMES OF GROUPS`, page `GROUP`. 8 data rows.

```
A CODE | B CHECK-LIST | C GROUP | D LANG1 | E NAME1 | F LANG2 | G NAME2
```

| CODE | CHECK-LIST | GROUP | PTG | ENG |
| --- | --- | --- | --- | --- |
| 1 | 1 | 1 | Inspeções Pré-ensaio (IPE) | Pre-Test Inspections (PTI) |
| 2 | 1 | 2 | Verificações e Ensaios (VE) | Verifications and Tests (VT) |
| 3 | 1 | 3 | Procedimentos de Inspeção (I), Verificação (V), Substituição (S) Limpeza (L) e Teste (T) | Procedures of Inspection (I), Verifications (V), Replacements (R), Cleaning (C) and Test (T) |
| 4 | 1 | 4 | Ensaio / Teste de caudal (T) | Flow Test (F) |
| 5 | 2 | 1 | *(same as code 1)* | |
| 6 | 2 | 2 | *(same as code 2)* | |
| 7 | 2 | 3 | *(same as code 3)* | |
| 8 | 2 | 4 | Ensai**os** e Teste de caudal (T) | Flow Test (F) |

**This file is the proof that groups are per-check-list.** Groups 1–4 ship twice, once for each
check-list template, and code 8's PTG name differs from code 4's. A globally-unique `code`
cannot represent that. Note the row-6 label is misspelled `CHEKC-LIST` in Form1 and Form2.

## `Form2_Sub_Groups.xlsx` → `CL_SUB_GR` + `CL_SUBGR_TEXT`

Header `TABLE OF NAMES OF SUB-GROUPS`. **33** data rows — 16 sub-groups for check-list 1,
**17** for check-list 2. (An earlier reading of "16 × 2" was wrong; corrected 2026-08-12 by
running the parser over the file.) The extra row is code 32, `02 / 03 / 10`,
`Nova ação teste` / `New test action` — its name says *action* while it sits in the
**sub-group** file, so it looks like a test row someone left in rather than spec content.
**Worth asking the client to confirm before it ships into a real check-list.** **[?]**

```
A CODE | B CHECK-LIST | C GROUP | D SUB-GROUP | E LANG1 | F NAME1 | G LANG2 | H NAME2
```

Sub-groups for check-list 1 (check-list 2 repeats them as codes 17–32):

| GROUP | SUB-GR | PTG | ENG |
| --- | --- | --- | --- |
| 1 | 1 | Sala de Bombas S.I. | Pump House |
| 1 | 2 | Condição de Bombas S.I. | Pump Conditions |
| 1 | 3 | Condição do sistema Eléctrico - Jockey | Jockey Electric System condition |
| 1 | 4 | Condição do motor Diesel | Diesel engine condition |
| 2 | 1 | Bombas S.I. | Fire Fighting Pumps |
| 2 | 2 | Bomba Elétrica | Electric unit |
| 3 | 1 | Bombas S.I. | Fire Fighting Pumps |
| 3 | 2 | Sistema de transmissão | Coupling system |
| 3 | 3 | Bomba S.I. Elétrica | Electric pump |
| 3 | 4 | Sistema de combustível - Motor Diesel S.I. | Fuel system - Diesel Engine |
| 3 | 5 | Sistema de lubrificação - Motor Diesel S.I. | Lube system - Diesel Engine |
| 3 | 6 | Sistema de refrigeração - Motor Diesel S.I. | Cooling system - Diesel Engine |
| 3 | 7 | Sistema de escape - Motor Diesel S.I. | Exaust system - Diesel Engine |
| 3 | 8 | Baterias - Motor Diesel S.I. | Bateries - Diesel Engine |
| 3 | 9 | Sistema de elétrico - Motor Diesel S.I. | Electric system - Diesel Engine |
| 4 | 1 | Bombas S.I. | Fire Fighting Pumps |

Sub-group *names* repeat across groups (`Bombas S.I.` is 2/1, 3/1 and 4/1) — another reason the
name cannot be the key.

## `Form3_Actions.xlsx` → `CL_ACTION` + `CL_ACTION_TEXT`

Header `TABLE / NAMES OF ACTIONS`, page **`ACTIONS (2)`**. Only **13 data rows**.

```
A CODE | B CHECK-LIST | C GROUP | D SUB-GROUP | E ACTION | F PERIOD
     | G LANG1 | H TYPE1 | I SOURCE1 | J NAME1     <- 4 columns per language
     | K LANG2 | L TYPE2 | M SOURCE2 | N NAME2
```

`[F] PERIOD` maps to `CL_ACTION.Period` (not a `_TEXT` field) and holds a `PERIODICITY` code —
values seen: `1` (Weekly), `2` (Monthly).
`TYPE` is the localized group abbreviation (`IPE` / `PTI`).
`SOURCE` is the NFPA-25 clause (`8.2.2(1)(a/b)`) or `Instruções do Fabricante` /
`Mnfct instructions` for manufacturer requirements. Clause formatting is inconsistent —
`8.2.2(1)(c)` and `8.2.2 (1) (c)` both appear.

Sample (group 1, sub-group 1):

| ACTION | PERIOD | SOURCE | PTG name |
| --- | --- | --- | --- |
| 1 | 2 | Instruções do Fabricante | Verificação do estado de limpeza da sala e acessibilidade aos grupos de bombagem |
| 2 | 2 | 8.2.2(1)(a/b) | Verificação da temperatura ambiente com as portas fechadas |
| 3 | 2 | Instruções do Fabricante | Verificação do estado da sinalética e validade dos extintores. |
| 4 | 1 | 8.2.2(1)(c) | Estado da ventilação sala e grelhas de ventilação |
| 5 | 1 | 8.2.2 (1) (d) | Acumulação de excesso de água no piso |
| 6 | 1 | 8.2.2 (1) (c) | Proteção do acoplamento instalada |

### This file is incomplete — and it blocks seeding

All 13 rows are `CHECK-LIST=1`, `GROUP=1`, sub-groups 1–2 only. The page header
`ACTIONS (2)` implies a multi-part file. Meanwhile:

- `Form1`/`Form2` define 4 groups and 16 sub-groups **per check-list, × 2 check-lists** — nearly
  all with zero actions.
- `Form4_Measurements.xlsx` references **`GROUP=2`** actions (sub-groups 1–3, actions up to 11)
  **that do not exist in `Form3`**. The measurement data is dangling.

The importer can be built and tested against these layouts — they are consistent and
unambiguous. But no realistic check-list can be seeded until the client sends the complete
`Form3_Actions` covering all groups and both check-list templates. This is a much narrower ask
than the original "send us the spreadsheets".

Note the drawing p3 lists `Form3_Actions.xlsx` as the source for **both** `CL_ACTION_TEXT` and
`CL_VALUES_TEXT`. That is a copy-paste error: `Form3` has a single sheet and no `INDEX` column.
`CL_VALUES_TEXT` comes from `Form4`, whose header matches p3's mapping exactly.

## `Form4_Measurements.xlsx` → `CL_ACTION_VALUES` + `CL_VALUES_TEXT`

Header `TABLE / NAMES OF MEASUREMENTS`, page `Names`. ~57 data rows.

```
A CODE | B CHECK-LIST | C GROUP | D SUB-GROUP | E ACTION | F INDEX
     | G LANG1 | H NAME1 | I LANG2 | J NAME2
```

`[F] INDEX` is `CL_ACTION_VALUES.Code` — the slot number when one action takes several readings.
The text is a **field label with its unit**, not a value:

| GROUP/SUB/ACTION | INDEX | PTG | ENG |
| --- | --- | --- | --- |
| 2/1/2 | 1 | Valor (bar): | Value (bar): |
| 2/1/6 | 1 | Valor (bD): *[typo for dB]* | Value (dB): |
| 2/1/7 | 1 | X ou Horizontal (mm/s): | X or Horizontal (mm/s): |
| 2/1/7 | 2 | Y ou Vertical (mm/s): | Y or Vertical (mm/s): |
| 2/1/8 | 1 | Frontal (ºC): | Frontal (ºC): |
| 2/1/8 | 2 | Traseiro (ºC): | Rear (ºC): |
| 2/1/11 | 1 | Mais alta (bar): | Higher (bar): |
| 2/1/11 | 2 | Mais baixa (bar): | Lower (bar): |
| 2/3/3 | 1 | RPM (Após arranque): | RPM (After start): |
| 2/3/3 | 2 | RPM (Após 10 min): | RPM (After 10 min): |
| 2/3/3 | 3 | RPM (Após 15 min): | RPM (After 15 min): |

So an action is not just pass/fail: it can carry *n* numeric inputs, each with its own localized
label and unit. The actual readings go in `MEASUREMENTS.Value N(6.1)`. Units are baked into the
label string rather than being a separate field.

## `Table_Language.xlsx` → `LANGUAGE` (Action#22)

```
A CODE | B NAME | C COUNTRY | D FLAG
```

| CODE | NAME | COUNTRY | FLAG |
| --- | --- | --- | --- |
| PTG | Português | Portugal | `Flag_PTG.jpg` |
| ENG | English | England | `Flag_ENG.jpg` |
| ENS | English | Scotland | `Flag_ENS.jpg` |
| ENU | English | US | `Flag_ENU.jpg` |
| FRA | François *[sic — Français]* | France | `Flag_FRA.jpg` |
| ESP | Español | España | `Flag_ESP.jpg` |
| GER | Deutsch | Deutschland | `Flag_GER.jpg` |

**`CODE` is the 3-letter key used by every `Language` field in the model.** The app's i18n uses
2-letter `en`/`pt` (`translations/languages/`), so a mapping layer is needed at the import
boundary. Note `ENG`/`ENS`/`ENU` share the name "English" and differ only by country — so the
key is a locale, not a language, and `en` alone cannot round-trip it.

No flag images are in the bundle.

## `Table_Peridiocity.xlsx` → `PERIODICITY` (Action#04) and `MAINT_TYPE` (Action#23)

```
A CODE | B LANG1 | C TEXT1 | D LANG2 | E TEXT2      (data starts row 7 here, not 9)
```

| CODE | PTG | ENG |
| --- | --- | --- |
| 1 | Semanal | Weekly |
| 2 | Mensal | Monthly |
| 3 | Trimestral | Quarterly |
| 4 | Semestral | Semestrally |
| 5 | Anual | Annually |
| 6 | Bienal | Bi-Annually |
| 7 | 3-anual | 3-Annually |
| 8 | 5-Anual | 5-Annually |

8 codes fit `CL_ACTION.Period S(1)`. The file's own title row says `TABLE OF FIELDS NAMES`
(copy-pasted from `Table_Field_Names.xlsx`) — ignore it. Filename misspells *periodicity*;
`#Actions.xlsx` refers to it as `Table_Periodicity.xlsx`, spelled correctly, so an importer
should not match on the exact filename.

## `Table_Ctrl_Status.xlsx` → `CTRL_STATUS` (Action#04)

```
A CODE | B LANG1 | C TEXT1 | D LANG2 | E TEXT2
```

| CODE | PTG | ENG |
| --- | --- | --- |
| 1 | Automático | Automatic |
| 2 | Manual | Manual |
| 3 | Desligado | Off |

**Conflicts with p3's pre-set table**, which gives `INTERVENTION.Controler_Status` as
`A`/`M`/`0`. Same three meanings, two different key sets. The xlsx is the loaded artifact so it
probably wins — needs confirming.

## `#Tipos Sub-Grupo.xlsx` / `#Tipos Sub-Grupo NP.xlsx` → applicability matrix

Header `Sub-Groups Types`. Not an input table for any DB table — it is the **applicability
matrix** the index calls "General organization of Sub-Groups" (§2.1, which names the `NP`
variant as the current one).

```
A GROUP | B group name | C SUB-GROUP | D sub-group name | (APLICÁVEL A:) F Sala SI | G Jockey | H B.Elétrica | I B.Diesel
```

An `x` marks which pump kinds a sub-group applies to. From the `NP` file:

| GROUP/SUB | Sala SI | Jockey | B.Elétrica | B.Diesel |
| --- | --- | --- | --- | --- |
| 1/1 Sala de Bombas | x | | | |
| 1/2 Condição de Bombas | | | x | x |
| 1/3 Sistema Eléctrico - Jockey | | x | | |
| 1/4 Condição do motor Diesel | | | | x |
| 2/1 Bombas S.I. | | | x | x |
| 2/2 Bomba Elétrica | | | x | x |
| 3/1 Bombas S.I. | | | x | x |
| 3/2 Sistema de transmissão | | | x | x |
| 3/3 Bomba S.I. Elétrica | | | x | |
| 3/4–3/9 Diesel subsystems | | | | x |

**This is very likely the domain of `CL_ACTION.Pump_Type* S(1)*`** — four categories
(`Sala SI` / `Jockey` / `B.Elétrica` / `B.Diesel`), not the three of `PUMP_GROUP.Type`
(`J`/`E`/`D`). The extra one, "Sala SI" (pump room), matches `PUMP_GROUP.Type = J` being
labelled *"Jockey (+ Pump Room)"* on p3. So the mapping between `Pump_Type` and
`PUMP_GROUP.Type` is not 1:1 and needs confirming — it decides whether one check-list template
serves all pump types with per-action filtering.

The two variants disagree: the non-`NP` file marks only 1/1, 3/3 and 3/4–3/9, leaving most rows
blank. Prefer `NP`, per the index.

## `Table_Field_Names.xlsx` → UI strings

**605 rows** of interface labels, keyed by screen, in 4 languages:

```
A # | B SOURCE | C DEFAULT CONDITION | D PT | E EN | F FR | G ES
```

| # | SOURCE | PT | EN |
| --- | --- | --- | --- |
| 1 | Screen#01 | Língua | Language |
| 2 | Screen#01 | Nome de Utilizador | Username |
| 3 | Screen#01 | Código de Acesso | Password |
| 4 | Screen#01 | Aceder | Access |
| 5 | Screen#01 | Novo Utilizador | New User |
| 6 | Screen#02 | REGISTO DE NOVA EMPRESA | NEW COMPANY REGISTRATION |
| 7 | Screen#02 | Nome da Empresa | Name of Company |
| 8 | Screen#02 | Morada1 | Adress1 *[sic]* |

This is the source for `translations/languages/` — and it uses **2-letter** codes (`PT`/`EN`/
`FR`/`ES`), unlike the 3-letter `PTG`/`ENG` of the data files. `FR`/`ES` columns are empty.
The `#` column is the `ScreenField` number that `#Actions.xlsx` refers to (Action#01 changes
"Field's Names `001 002 003 004 005`" on Screen#01 — i.e. rows 1–5 above).

Not yet transcribed in full. It is a direct feed for i18n work, worth extracting properly when
that comes up.

## `#Actions.xlsx` → action pseudocode

This is the **implementation spec** for all 31 actions — the missing link between the menu
drawings and the data model. Layout is loose prose in columns C/D/E, grouped by action number
in column A, with the originating screen in column B.

### Action#04 — verbatim

```
#04 ??   Create Record table.CHECK_LIST

#04      Clear ScreenField082
         Fill table.CL_GR_TEXT     from [source]  with table.CHECK_LIST:Code = [current]
         Fill table.CL_SUBGR_TEXT  from [source]  with "
         Fill table.CL_ACTION_TEXT from [source]  with "
         Fill table.CL_DETAIL_TEXT from [source]  with "

         No errors found:  Create Record table.CHECK_LIST with data from screen
                           Set ScreenField082 = " X "
                           Activate ScreenField#088

         Errors found:     Set ScreenField084 = " X "
```

This settles several open questions:

- **Action#04 writes four `_TEXT` tables**, stamped with the current `CHECK_LIST:Code`.
  It does *not* read a global catalog populated by #22. (Q4 answered.)
- **The import is mandatory before OK.** `ScreenField#088` is the OK button, and it is only
  *activated* on success. (Q6 answered: yes.)
- **`SF#082`/`SF#084` are indicators, not buttons** — set to `" X "`, checkbox-style. The user
  sees no error list, only the marker. (Q5 partly answered; what *counts* as an error is still
  unstated.)
- **`[source]` is literally a bracketed placeholder.** The spec never names the file here; only
  p3 does (`Form1`–`Form4`). And the `#04 ??` row is the client's *own* open question about
  whether #04 creates the `CHECK_LIST` record — the record then gets created again under
  "No errors found", so the sequencing is genuinely unresolved in the spec.
- **Naming drift:** `#Actions.xlsx` calls the fourth table `CL_DETAIL_TEXT` and (in Action#07)
  `CL_ACTION_DETAIL`, where p2 calls them `CL_VALUES_TEXT` and `CL_ACTION_VALUES`. Same tables.

### Action#07 — validation

```
#07   Validate new records:  table.CHECK_LIST / CL_GR / CL_SUB_GR / CL_ACTION / CL_ACTION_DETAIL
      Activate ScreenField#087
```

### Actions #22 / #23 — the admin uploads

```
#22  Screen#03   Update table.LANGUAGES from Text / Excel file: Table_Language.xlsx
                 no errors -> PopUp "Languages Updated successfully."   Input "OK"
                 errors    -> PopUp "Errors during Upload."            Input "OK"

#23  Screen#03   Update table.MAINT_TYPE from Text / Excel file: Table_Periodicity.xlsx
                 no errors -> PopUp "Periodicity Updated successfully." Input "OK"
                 errors    -> PopUp "Errors during Upload."            Input "OK"
```

Confirms these two touch **only** `LANGUAGE` and `MAINT_TYPE` — not groups, sub-groups or
actions. The earlier assumption that #22 populates an action catalog was wrong.

### The rest, in brief

| # | Screen | What it does |
| --- | --- | --- |
| #01 | Screen#01 | Re-label fields `001`–`005` to the language chosen in PopUp#01 |
| #02 | | Validate username against `CUSTOMER:Name` / `SUPPLYER:Name` |
| #03 | | Validate a customer: fill `Validated_By`, `Date_Validated`, `Condition = "1"` |
| #05 | | Username-exists checks driving `SF#018` enable + `SF#014` clear; also `len < 10` rule |
| #06 | | Same for supplier, on `SF#102` / `SF#096` |
| #08 | | Validate a supplier (mirror of #03) |
| #09–#13 | | `TECHNICIAN_SUP` / `SUPPLYER` create, update, display |
| #14 | | Default language = `CUSTOMER:Language` |
| #15–#19 | Screen#09–#12 | `TECHNICIAN_CUST` create / update / soft-delete (`Condition = 2`) |
| #20, #21 | Screen#09, PopUp#22 | Generate `REPORT#01`, save to `xLocation` |
| #24, #25 | Screen#13/#14 | `PUMP_GROUP` create / edit, `Condition = "1"` |
| #26–#29 | | Generate + save `REPORT#02`, `REPORT#03` |
| #30, #31 | Screen#09, PopUp#42 | PDF of all `INSTALLATION` fields; save `REPORT#10` |

Deletes are **soft** throughout — `Condition = 2` rather than a row removal, consistent with the
`Condition` pre-set values in `data-model.md`.

> **Do not implement Action#02 as written.** It accepts a hardcoded literal password
> (`=="presidentE1990"`) as an alternative to a real user lookup. Whatever it was for in the
> original design, it is a credential backdoor and must not reach the codebase. Flag it to the
> client.

## `#Screens_Pop-ups List.xlsx` → screen registry

Sheet 1 `Screens` (14 rows), sheet 2 `Pop-Ups` (43 rows). Columns: `# | DESCRIPTION | FROM`,
where `FROM` is the screen(s) that navigate to it. This is the key for every `Screen#nn` /
`PopUp#nn` reference in the drawings and in `#Actions.xlsx`.

Screens: 1 entry · 2 new company registration · 3 administrator menu · 4 new service provider
registration · 5 service provider menu · 6/7/8 SP new / edit technician, edit record ·
9 customer menu · 10/11/12 customer technician new / edit / delete · 13/14 `PUMP_GROUP`
new / edit.

Pop-ups include: 1 language selection · 7 **Create New Check-List, by Administrator**
(from Screen#03 — this is `PopUp#07`, the Action#04 host) · 20/21 customer technician selection ·
23 installation selection · 24 "No Installations defined" · 25 "No Technicians defined".

## `#Emails.xlsx` → notification templates

Two sheets, both skeletal:

| | email1 | email2 |
| --- | --- | --- |
| TO | `admin_FP25@equitotal.pt` | `admin_FP25@equitotal.pt` |
| SUBJECT | `FIREPUMP25 - Request for New Customer` | `FIREPUMP25 - Request for New Serv. Provider` |
| CONTENTS | `table.CUSTOMER.Name` … `table.CUSTOMER.Language` | `table.SUPPLYER.Name` … `table.SUPPLYER.Language` |

The body is `....` — an unwritten placeholder. Real templates need to be requested.

## Cross-file inconsistencies (summary)

Worth having in one place, since a parser has to survive all of them:

| Issue | Detail |
| --- | --- |
| Language key width | `PTG`/`ENG` in data files, `PT`/`EN` in `Table_Field_Names`, `S(2)` vs `S(3)` in the model |
| `CTRL_STATUS` keys | `1`/`2`/`3` in the xlsx vs `A`/`M`/`0` in p3's pre-set table |
| Fourth table's name | `CL_VALUES_TEXT` / `CL_ACTION_VALUES` (p2) vs `CL_DETAIL_TEXT` / `CL_ACTION_DETAIL` (`#Actions`) |
| `CL_VALUES_TEXT` source | p3 says `Form3`; it is actually `Form4` |
| Filename spelling | `Table_Peridiocity.xlsx` (file) vs `Table_Periodicity.xlsx` (`#Actions`) |
| `SUPPLYER` / `SUPPLIER` | Both spellings across the spec |
| Header label typos | `CHEKC-LIST` (Form1, Form2), `Valor (bD)` (Form4), `Adress1`, `Exaust`, `Bateries`, `François` |
| Wrong title rows | `Table_Peridiocity` is titled `TABLE OF FIELDS NAMES`; index §2.4 calls `Form3_Actions` "Names of Groups" |
| `Text S(50)` too short | Longest group name in `Form1` is 91 chars |
| Drawing revision | Index says `FP25-INFOLOG-R0.dwg`; PDFs are named `-R1` |

## Still missing from the client

1. **Complete `Form3_Actions.xlsx`** — all groups, both check-list templates. Blocks seeding.
2. `FP25 - EQ0102 Rev7.pdf` — the basic report (index §2.0).
3. `FP25 RGPD Rev2` — user agreement (index §1.1).
4. Real email body text for `#Emails.xlsx`.
5. Flag images (`Flag_PTG.jpg` etc.).
6. Confirmation of the `Pump_Type` domain, the `CTRL_STATUS` key set, and whether an Action#04
   re-import replaces or merges (still open — see `checklist-actions-import.md`).
