# FIREPUMP25 — Screens and Flows (spec transcription)

Transcription of `app/assets/FP25-INFOLOG-R1-Menus1 (2).pdf` (sheet **4/6**, index §6.2) and
`FP25-INFOLOG-R1-Menus2 (2).pdf` (sheet **5/6**, index §6.3). Written 2026-08-31.

`checklist-actions-import.md` already covers the slice of these two sheets that concerns
**Action#04 / #22 / #23** (login → Screen#03 admin menu → PopUp#07 New Check-List). This file
covers **everything else on them**, which had never been written down: registration, the
service-provider menu, the whole customer menu, and the intervention lifecycle.

Screen and pop-up numbers resolve against `#Screens_Pop-ups List.xlsx` (see `spec-inputs.md`);
action numbers against `#Actions.xlsx`. Report layouts are in `reports-outputs.md`.

Extraction method and its caveats are described at the top of `reports-outputs.md`. Ambiguous
readings are marked **[?]**.

---

## Sheet 4/6 — entry, registration, admin, service provider

### Screen#01 — Login

| Field | Contents |
| --- | --- |
| `SF#001` | **Language** — browse `table.LANGUAGE`; selecting a row sets the LANGUAGE parameter and fires **Action#01**, which re-labels fields `001`–`005`. PopUp#01. |
| `SF#002` | **Username** → `Define xUsername` |
| `SF#003` | **Password** → `Define xPassword` |
| `SF#004` | **Access** → Action#02 |
| `SF#005` | **New User** → PopUp#08 |

**Action#02 — the login branch, verbatim in structure:**

```
username found ?
  N -> PopUp#16 "User name not found!"            OK -> [Return to Screen#01]
  Y -> Define variable xLast_Check_List = BIGGEST (table.CHECL_LIST:Code)   [sic]
       |
       +- xUsername == "presidentE1990"      -> Screen#03  ADMINISTRATOR MENU
       +- xUsername in table.CUSTOMERS:Name  -> Define xLanguage = table.CUSTOMER:Language
       |                                        -> Screen#09  CUSTOMER MENU
       +- xUsername in table.SUPPLYER:Name   -> Screen#05  SERVICE PROVIDER MENU
       +- otherwise                          -> PopUp#17 "Access Error!!"
```

Two things worth pulling out:

- **`xLast_Check_List` is set here, at login, for every user** — `BIGGEST(CHECK_LIST:Code)`. It
  is the variable `REPORT#03` loops over. Nothing anywhere lets a user pick a check-list
  template; the newest one always wins. See `reports-outputs.md`.
- **The hardcoded password is a login *branch*, not a fallback** — matching `xUsername` against
  the literal `"presidentE1990"` is the *only* route to the administrator menu drawn on the
  sheet. There is no `ADMIN` table lookup anywhere in the flow, even though `data-model.md` has
  an `ADMIN` table. Already flagged as open question 11; this is how load-bearing it is.

`PopUp#08` (New User) — **"PLEASE INDICATE TYPE OF USER:"** `SF#026` CUSTOMER → Screen#02,
`SF#027` SERVICE PROVIDER → Screen#04.

### Screen#02 / Screen#04 — Registration

Two near-identical screens. Customer writes `table.CUSTOMER`, service provider writes
`table.SUPPLYER`.

| Screen#02 (customer) | Screen#04 (provider) | Field |
| --- | --- | --- |
| `SF#007` | `SF#091` | Name of Company (*) |
| `SF#008`–`#010` | `SF#092`–`#094` | Address1 (*) / Address2 / Address3 |
| `SF#011`, `#012` | `SF#095`, `#096` | Country (*) / Language (*) |
| `SF#013` | `SF#097` | Responsable Name (*) · **Acess Name (*)** → `Define xUser_Name` |
| `SF#015`, `#016` | `SF#099`, `#100` | Phone / Celular · Email (*) |
| `SF#014` + `#018` | `SF#102` + `#101` | uniqueness feedback, driven by Action#05 / Action#06 |
| `SF#020`–`#023` | `SF#105`–`#108` | Read Access Conditions · Accept Access Conditions · Send Required Registration · Cancel |

Rules the drawing states explicitly (`PopUp#11` / `PopUp#12`, headed **PLEASE NOTE:**):

- **Access name minimum 10 characters.**
- **"User Name associated to this user cannot be changed in the future."**

Flow: *Read Access Conditions* → `PopUp#02` / `PopUp#15` — **"[Display text from GENERAL
CONDITIONS FILE]"** → *Accept* → `[Activate ScreenField#023]` (customer) /
`[Activate ScreenField#108]` (provider) → *Send Required Registration* → `PopUp#03` / `PopUp#10`
confirmation text:

> Thank you for accessing FirePump25
> Your request has been sent to the Administrator of the application, who will send you a
> confirmation to your email, after approval.
> You will then receive a password, that you should change on your first login.
> Other users or Administrators have no access to this password, so please keep good track of it.

→ `[Send email1 do Administrator]` (customer) / `[Send email2 do Administrator]` (provider) →
Return to Screen#01. Those are the two rows in `#Emails.xlsx`.

**The GENERAL CONDITIONS FILE is `FP25 RGPD Rev2` (index §1.1) and is not in the bundle.**

### Screen#03 — Administrator menu

Correcting the field numbers given in `checklist-actions-import.md`:

| Field | Label | Action |
| --- | --- | --- |
| `SF#051` | Validate Customer access | PopUp#04 → #05 → #06 → **Action#03** |
| `SF#052` | Validate Supplyer access | PopUp#13 → #14 → #15 → **Action#08** |
| `SF#053` | Update Languages Table | **Action#22** |
| `SF#160` | Create new Check-List | PopUp#07 → **Action#04** / **Action#07** |
| *(unnumbered)* | Update Periodicity Table | **Action#23** |
| *(unnumbered)* | Delete Customer's Data | marked `[H01]` — **no action, no target, nothing else on the sheet defines it** **[?]** |
| `SF#0xx` | LogOut | Return to Screen#01 |

The validation flow (customer; supplier mirrors it):

```
PopUp#04  "Username requested: [Define xName]"
          -> N: PopUp#... "User name not found! ... xName exists in table CUSTOMER ?"
          -> Y: PopUp#05  [Display (table.CUSTOMER:Access_Name) = "xName"]
                          [table.CUSTOMER:Name] [Address1] [Address2] [...] [Language]
                 SF#058 / SF#059 -> PopUp#06  "OK to validate" / "Not OK"
                 OK -> Action#03: fill Validated_By, Date_Validated, Condition = "1"
```

**Delete Customer's Data is the only GDPR-shaped operation in the whole spec and it is
undefined.** Given the missing RGPD document, worth asking about together.

### Screen#05 — Service provider menu

`SF#135` "Welcome, [Display table.SUPPLYER:Name]", `SF#130` SERVICE PROVIDER MENU.

| Field | Label | Goes to |
| --- | --- | --- |
| `SF#131` | Edit Registration | Screen#08 → Action#13 |
| `SF#132` | Define / Change Responsable | *Create / Change Supplyer's Resp.* pop-up → updates `SUPPLYER:Name_Responsable1` |
| `SF#133` | Regist new Technician | Screen#06 → Action#09 |
| *(unnumbered)* | Edit Technician Data | PopUp#19 (browse, `Define variable xName`) → Screen#07 → Action#11 / #12 |
| `SF#0xx` | LogOut | Return to Screen#01 |

- **Screen#06 — New Technician** (`SF#166`–`#174`): Name (*) / Function / Phone / Email (*) /
  Certification, writing `table.TECHNICIAN_SUP`. Duplicate name → `PopUp#18` **"NAME ALREADY
  EXISTS !"** → `[Clear ScreenField#166]` → Action#10.
- **Screen#07 — Edit Technician** (`SF#181`–`#188`): same fields, *Cancel* / *Update*.
- **Screen#08 — SP Edit Record** (`SF#201`–`#212`): the `SUPPLYER` registration fields again,
  *Cancel* / *Update Record*.

### The pricing note

Bottom-left of sheet 4/6, in Portuguese, unattached to any screen:

> **Opções a cinzento só disponíveis para quem pagar** — *greyed-out options are only available
> to those who pay.*

So the drawing encodes a **paid tier** by greying menu entries. Which entries are grey is not
recoverable from the PDF text layer, and nothing else in the bundle mentions tiers or billing.
**Worth asking — it changes the permission model, not just the styling.** **[?]**

---

## Sheet 5/6 — Customer menu and interventions

### Screen#09 — Customer menu

`SF#211` "Welcome, [Display table.CUSTOMER:Name]" · `SF#215` CUSTOMER MENU · `SF#210` Edit Record
(→ `[Update Record table.CUSTOMER]`).

Five blocks:

| Block | Buttons |
| --- | --- |
| `SF#220` **INSTALLATION** | `#221` Create new · `#222` Edit existing · `#223` Change Condition · `#224` List installations (pdf) |
| `SF#230` **PUMP GROUP** | `#231` Create new · `#232` Edit / Set Active · `#233` Set Inactive · `#234` List of Groups (pdf) |
| `SF#240` **MAINTENANCE TECHNICIANS** | `#241` Create new · `#242` Edit · `#243` Suspend · `#244` List of Technicians (PDF) |
| `SF#250` **REPORTS** | `#251` Print Blank · `#252` Create New · *(unnumbered)* Finalize existing · `#253` View existing · `#254` Print (PDF) |
| `SF#260` | CREATE / CHANGE RESPONSABLE |

Plus, off the header: **Change password** (marked `(P4)`, continued from sheet 4/6),
**Send message**, **LogOut**.

### Change password `(P4)` and Send message

```
Input Old Password:  [Input X1]
  -> Validate Password
     IF OK:  [1] Input New Password:  [Input X2]  [Clear Fields #A1 #A2]
             Confirm Password:        [Input X3]
             IF OK: Update password file with X3 ; Return to Screen#09
             ELSE:  "Passwords don't match"                 [SF#A1]  GOTO [1]
             ELSE:  "Valid characteres ... Minimum ...."     [SF#A2]  GOTO [1]
```

The character rule is elided in the drawing; `PopUp#11`/`#12` on sheet 4/6 give the minimum as
**10 characters**.

**Send message** is a one-field form: `Input text to be sent: [Input Text1]` → *Send* →
`Send email to ADMIN@FP25.com with Text1`. (Note the address differs from `#Emails.xlsx`'s
`admin_FP25@equitotal.pt`. **[?]**)

This one is already built to spec, end to end: `modules/Main/components/SendMessage.tsx` (single
text field, Cancel / OK) is rendered from `modules/Main/index.tsx` and calls
`actions/clientActions/message.actions.ts` → `app/api/send-message/route.ts`, which emails
`ADMIN@FP25.com` via nodemailer.

### Installations

- **Create new** → Screen#... , `[Fill all fields from table.INSTALLATION]`, Action#16.
- **Edit existing** → `PopUp#22` "Please select one Installation" (browse
  `INSTALLATION:Name with Code_Customer = CUSTOMER:Code`) → `[Browse / Edit all fields]` →
  `[Update Record table.INSTALLATION]`, Action#17/#18.
- **Change Condition** → `PopUp#26` select → `PopUp#28`:
  ```
  CURRENT CONDITION: [Display table.INSTALLATION:Condition]
  SET NEW CONDITION: ( ) Active [Set var=1]
                     ( ) Exist but not Active [Set var=2]
                     ( ) Deleted [Set var=3]
  -> [Set INSTALLATION:Condition = var]
  ```
  Confirms p3's `1`/`2`/`3` domain for `INSTALLATION.Condition`, and that **"Deleted" is a
  condition value, not a row removal**.
- **List installations (pdf)** → Action#30 `Generate Report [#10]: All fields from
  table.INSTALLATION [with INSTALLATION:Code_Customer = table.CUSTOMER:Code]` → `PopUp#41`
  "List generated. Save location: [Input xLocation]" → Action#31 (`PopUp#42`).

Empty-state pop-ups are specified: `PopUp#24` **"There are no Installations defined for this
Customer!"**, `PopUp#25` **"There are no Technicians defined for this Customer!"**, and
(for pump groups) **"There are no Pump Groups defined for this Installation!"**.

The selection pop-ups all carry the same guard: `Browse all fields; If [no fields] ... Else:
Select one field; Define variable xInstallation` — i.e. every selector must handle empty.

### Pump groups

- **Create new** → Screen#13 (`SF#370`–`#405`), **Edit** → Screen#14 (`SF#431`–`#466`).
  Both lay out the same six blocks as `REPORT#02`: PUMP (Type `(J/E/D)` (*), Sub_Type (*), TAG,
  Brand (*), Model (*), S/N) · MOTOR / ENGINE · CONTROLLER · COUPLING · GEARBOX · VT PUMPS
  (Column lenght, Nr. of Stages). Action#24 / Action#25.
- **Set Inactive** → `PopUp#31` installation → `PopUp#33` pump group → `PopUp#34` `Confirm?` →
  **`[Set PUMP_GROUP:Condition = "0"]`**. See the `Condition` domain conflict in
  `reports-outputs.md`.
- **List of Groups (pdf)** → Action#26 (Report#02) → `PopUp#35` save → Action#27.

### Customer technicians

- **Create new** → Screen#10 (`SF#270`–`#280`): Name (*) / Function / Phone / Email (*) /
  Certification / Language (*). **Action#14** defaults the language to `CUSTOMER:Language`.
  Action#15 creates.
- **Edit** → `PopUp#20` select (`with TECHNICIAN_CUST:Condition = 1`) → Screen#11, Action#17.
- **Suspend** → `PopUp#21` select → Screen#12 shows the record read-only, *Cancel* / **Suspend**
  → Action#19 (`Condition = 2`).
- **List of Technicians (PDF)** → Action#20 (Report#01) → `PopUp#22` "List generated. Save
  location: [Input xLocation]" → Action#21.

Note the selectors filter on `Condition = 1`, so a suspended technician disappears from Edit and
Suspend but still prints on REPORT#01 (which prints the condition column).

### Installation responsable

*CREATE / CHANGE RESPONSABLE* (`SF#260`): select installation →
`[Search for INST_RESPONSABLE:Code = INSTALLATION:Responsable]` → `If Found: Print Current
Responsable: table.INST_RESPONSABLE:Name` → browse all records of `INST_RESPONSABLE` displaying
`NAME`, select one → `[Set INSTALLATION:Responsable = INST_RESPONSABLE:Code]`.

**The flow only ever *links* an existing `INST_RESPONSABLE`; nothing on either sheet creates
one.** The equivalent provider-side flow (sheet 4/6) just overwrites the free-text
`SUPPLYER:Name_Responsable1`. **[?]** — ask where `INST_RESPONSABLE` rows come from.

### Interventions — the lifecycle

This is the core of the product and none of it is implemented. All four entries first walk the
same selection chain: Installation → Pump Group → (for the existing-report cases)
Intervention, chosen by `table.INTERVENTION:Ref_Month`.

**Create New** (`SF#252`)

```
-> INPUT (on Screen) all fields from table.INTERVENTION;
   Including all fields from tables: INT_NOTES / INT_RESULT / MEASUREMENTS;
                                     TECHNICIAN_INT1 / TECHNICIAN_INT2
                                     CTRL_STATUS

   IF table.INT_RESULT:Result = "V" OR "*"
      INPUT table.INT_NOTES:Text

   "Add additional notes ?"  Yes / No
      Yes -> INPUT table.INT_NOTES:Text
             CREATE RECORD table.INT_NOTES WITH table.INT_NOTES:Code_Interv_Result = 0   [Rev1]

   "Save and lock Report ?"  OK / Cancel
      OK  -> SET table.INTERVENTION.Locked = 2
   -> ESC ? [Return to Screen#09]
```

**Finalise existing**

```
-> EDIT (on Screen) all fields from table.INTERVENTION.Code;  (same table list as above)

   "Save and lock Report ?"  OK / Cancel
      OK  -> SET table.INTERVENTION.Locked = 2
             Send email to ADMIN with: Customer.ID
                                       Installation.ID
                                       PumpGroup.ID
                                       Intervention.ID
             List all table.CL_ACTION:Code where table.INT_RESULT:Result = 'X' or '*'
      and  -> SEND email WITH ALL RECORDS FROM table.INT_NOTES
              From current table.INTERVENTION to Administrator          [Rev1]
```

**View existing** — `BROWSE (on Screen) all fields`, same table list, read-only, ESC returns.

**Print (PDF)** (`SF#254`)

```
-> Generate PDF table.INTERVENTION.Code;
   With all fields from tables: INT_NOTES / INT_RESULT / MEASUREMENTS;
                                TECHNICIAN_INT1 / TECHNICIAN_INT2 / CTRL_STATUS

   IF table.INTERVENTION.Locked = 2 -> INPUT SAVE location ; SAVE report
   ELSE PRINT: "Report not Locked; cannot be printed"
```

**Print Blank** (`SF#251`) — `PopUp#36`/`#37` installation, `PopUp#38`/`#39` pump group:

```
Define variable xCode = PUMP_GROUP:Code
Define variable xType = PUMP_GROUP:Type
-> PopUp#40  "Include Notes from previous Report?"  Yes -> xNotes = "Y"  /  No -> xNotes = "N"
-> Action#28 (Report#03) -> "List generated. Save location: [Input xLocation]" -> Action#29
```

`xType = PUMP_GROUP:Type` is **the only place in the spec where a pump type becomes a report
variable**, and `REPORT#03` is the report that loops `CL_ACTION`. That is direct evidence for
open question 9: **`CL_ACTION.Pump_Type` filters the actions on a blank report by the selected
pump group's `Type` (`J`/`E`/`D`)**, i.e. one check-list template really does serve all pump
types with per-action filtering. It does *not* resolve the four-vs-three mismatch with
`#Tipos Sub-Grupo NP.xlsx` (`Sala SI` / `Jockey` / `B.Elétrica` / `B.Diesel`) — that still needs
the client.

Note `xType` is defined but the drawing never shows it being *used*; the `( . . . )` in
`REPORT#03` is where the filter would be. **[?]**

Also note the two conflicting `Result` predicates: notes are prompted for on `"V" OR "*"`
(V = **Ok** per p3), while the admin failure email lists `'X' or '*'` (X = Fail). And `*` is not
in p3's domain (`V` / `X` / `-`) at all. Prompting for a note on a *passing* action reads like a
transcription slip for `"X"`. **[?]**

---

## What the repo has, against these two sheets

| Spec area | Repo |
| --- | --- |
| Login, password recovery/update | Built (`app/(auth)/`), Supabase auth rather than the spec's own password file |
| Language selector, i18n | Built (`i18next`, `translations/languages/`), but **not seeded from `Table_Field_Names.xlsx`'s 605 strings** |
| Customer / provider self-registration + general conditions + admin approval emails | **Missing.** `modules/Auth/SignupModal.tsx` exists; no conditions file, no `Validated_By`/`Date_Validated`, no email |
| Admin menu (validate customer / supplier, delete customer data, periodicity upload) | **Missing** — only the check-list side of Screen#03 exists |
| New Check-List / Action#04 import | Built (`app/api/checklists/import/route.ts`) |
| Service provider menu, provider technicians | Partially — `technician` table and actions exist; no Screen#05–#08 flows |
| Customer menu blocks | Pages exist for `/installations`, `/pumps`, `/users`, `/interventions`, `/checklists`; the Change-Condition / Set-Inactive / Suspend soft-delete flows do not |
| `PUMP_GROUP` full field set (~25 fields, 6 blocks) | **Missing** — `types/pump.types.ts` has 4 fields |
| `INST_RESPONSABLE` | Partially — a `responsables` table exists; no link-to-installation flow |
| Intervention Create / Finalise / View / Print-blank / Print-PDF | **Missing.** No `Locked`, no `INT_RESULT`, no `INT_NOTES`, no `MEASUREMENTS`, no `TECHNICIAN_INT1/2`, no `CTRL_STATUS` |
| All five PDFs | **Missing.** No PDF library in `package.json` |
| Change password (spec's own rules), Send message to admin | Password: via Supabase. **Send message: built end to end and matches the spec** |
| Empty-state pop-ups, greyed paid tier | **Missing** |

The single largest gap is the intervention lifecycle: five tables and the `Locked` flag that
gates printing, none of which exist, and on which every report depends.
