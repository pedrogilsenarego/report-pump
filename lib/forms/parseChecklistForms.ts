/**
 * FIREPUMP25 — Action#04 form parser.
 *
 * Parses the four DATA-INPUT workbooks the client ships with the spec into the shape the
 * cl_gr / cl_sub_gr / cl_action / cl_action_values tree expects. Pure: takes ArrayBuffers,
 * touches no DB, so it runs identically in the browser or in a route handler.
 *
 *   Form1_Groups.xlsx        CODE | CHECK-LIST | GROUP                              | n x (LANG, NAME)
 *   Form2_Sub_Groups.xlsx    CODE | CHECK-LIST | GROUP | SUB-GROUP                  | n x (LANG, NAME)
 *   Form3_Actions.xlsx       CODE | CHECK-LIST | GROUP | SUB-GROUP | ACTION | PERIOD| n x (LANG, TYPE, SOURCE, NAME)
 *   Form4_Measurements.xlsx  CODE | CHECK-LIST | GROUP | SUB-GROUP | ACTION | INDEX | n x (LANG, NAME)
 *
 * Shared layout: rows 1-3 are a header block, row 6 carries the column labels, row 7 the
 * [A]..[N] keys from drawing p3, data starts at row 9. Trailing rows hold only a CODE —
 * they are empty templates and are skipped.
 *
 * The per-language blocks are DERIVED from the row-6 labels (LANG1/NAME1, LANG2/NAME2, ...),
 * never from a hardcoded stride. Form3's block is 4 columns wide where the others are 2, and
 * the spec allows up to 7 languages (Table_Language.xlsx), so a fixed stride would be wrong
 * the moment the client sends a third language.
 *
 * See docs/spec-inputs.md for the transcribed layouts.
 */

import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One language block on a row. `type` / `source` only appear in Form3. */
export type FormText = {
  /** The spec's 3-letter key, verbatim: PTG / ENG / ENS / ENU / FRA / ESP / GER. */
  language: string;
  name: string;
  /** Localized group abbreviation (IPE / PTI). Form3 only. */
  type?: string;
  /** NFPA-25 clause, or manufacturer instructions. Form3 only. */
  source?: string;
};

export type FormRow = {
  /** Spreadsheet row number, for error messages. */
  rowNumber: number;
  /** [A] CODE — a flat surrogate, unique per file. Not the identity. */
  code: number;
  checkList: number;
  group: number;
  subGroup?: number;
  action?: number;
  /** Form3 only — a PERIODICITY code. */
  period?: number;
  /** Form4 only — the measurement slot number. */
  index?: number;
  texts: FormText[];
};

export type FormKind = "form1" | "form2" | "form3" | "form4";

export type FormFiles = Record<FormKind, ArrayBuffer>;

export type ImportIssue = {
  file: FormKind | "cross";
  row?: number;
  message: string;
};

/** The tree, ready to insert. Codes are the spec's per-check-list numbering. */
export type ParsedChecklist = {
  /** Which CHECK-LIST template column these rows came from. */
  template: number;
  groups: Array<{
    code: number;
    texts: FormText[];
    subGroups: Array<{
      code: number;
      texts: FormText[];
      actions: Array<{
        code: number;
        period?: number;
        texts: FormText[];
        values: Array<{ code: number; texts: FormText[] }>;
      }>;
    }>;
  }>;
};

export type ParseResult = {
  /** False if `errors` is non-empty — drives the SF#082 / SF#084 marker. */
  ok: boolean;
  errors: ImportIssue[];
  /** Non-fatal: reported, but do not block the import. */
  warnings: ImportIssue[];
  /** Every CHECK-LIST value present across the four files, ascending. */
  templates: number[];
  /** Null when ok is false. */
  data: ParsedChecklist | null;
};

// ---------------------------------------------------------------------------
// Sheet reading
// ---------------------------------------------------------------------------

type Cell = string | null;
type Sheet = Cell[][];

const readSheet = (buffer: ArrayBuffer): Sheet => {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // raw:false so zero-padded codes ("01") and dates arrive as the strings they look like.
  return XLSX.utils.sheet_to_json<Cell[]>(sheet, {
    header: 1,
    raw: false,
    defval: null,
    blankrows: true,
  });
};

/** "CHEKC-LIST" (the typo in Form1/Form2) and "CHECK-LIST" have to compare equal. */
const normalizeLabel = (label: Cell): string =>
  (label || "").toString().toUpperCase().replace(/[^A-Z0-9]/g, "");

const IDENTITY_LABELS: Record<string, keyof FormRow> = {
  CODE: "code",
  CHECKLIST: "checkList",
  CHEKCLIST: "checkList",
  GROUP: "group",
  SUBGROUP: "subGroup",
  ACTION: "action",
  PERIOD: "period",
  INDEX: "index",
};

type Header = {
  /** Column index per identity field. */
  identity: Partial<Record<keyof FormRow, number>>;
  /** Column indexes per language block, in sheet order. */
  blocks: Array<{ lang: number; name: number; type?: number; source?: number }>;
  /** Index of the row-6 label row. */
  labelRow: number;
};

/**
 * Finds the label row and works out the column layout from it. Row numbers are not
 * assumed: the label row is the first one whose column A normalizes to "CODE".
 */
const readHeader = (sheet: Sheet): Header | null => {
  const labelRow = sheet.findIndex((row) => normalizeLabel(row?.[0]) === "CODE");
  if (labelRow < 0) return null;

  const labels = sheet[labelRow];
  const identity: Header["identity"] = {};
  // Language blocks keyed by their trailing digit: LANG1 / NAME1 / TYPE1 / SOURCE1.
  const blocks = new Map<string, Record<string, number>>();

  labels.forEach((raw, column) => {
    const label = normalizeLabel(raw);
    if (!label) return;

    const identityField = IDENTITY_LABELS[label];
    if (identityField) {
      // First occurrence wins — the identity block is left of the language blocks.
      if (identity[identityField] === undefined) identity[identityField] = column;
      return;
    }

    const block = label.match(/^(LANG|NAME|TYPE|SOURCE)(\d+)$/);
    if (!block) return;

    const [, field, ordinal] = block;
    if (!blocks.has(ordinal)) blocks.set(ordinal, {});
    blocks.get(ordinal)![field.toLowerCase()] = column;
  });

  // Array.from, not spread: tsconfig targets es5, where Map iterators are not iterable.
  const ordered = Array.from(blocks.entries())
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, columns]) => columns)
    .filter((columns) => columns.lang !== undefined && columns.name !== undefined)
    .map((columns) => ({
      lang: columns.lang,
      name: columns.name,
      type: columns.type,
      source: columns.source,
    }));

  return { identity, blocks: ordered, labelRow };
};

const toInt = (value: Cell): number | undefined => {
  if (value === null || value === undefined) return undefined;
  const text = value.toString().trim();
  if (!text) return undefined;
  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const text = (value: Cell): string => (value === null ? "" : value.toString().trim());

// ---------------------------------------------------------------------------
// Row parsing
// ---------------------------------------------------------------------------

/** Which identity fields each form must supply. */
const REQUIRED: Record<FormKind, Array<keyof FormRow>> = {
  form1: ["checkList", "group"],
  form2: ["checkList", "group", "subGroup"],
  form3: ["checkList", "group", "subGroup", "action"],
  form4: ["checkList", "group", "subGroup", "action", "index"],
};

const parseForm = (
  kind: FormKind,
  buffer: ArrayBuffer,
  errors: ImportIssue[],
  warnings: ImportIssue[]
): FormRow[] => {
  let sheet: Sheet;
  try {
    sheet = readSheet(buffer);
  } catch {
    errors.push({ file: kind, message: "File is not a readable .xlsx workbook." });
    return [];
  }

  const header = readHeader(sheet);
  if (!header) {
    errors.push({
      file: kind,
      message: "No column-label row found (expected a row starting with CODE).",
    });
    return [];
  }

  const missing = REQUIRED[kind].filter((field) => header.identity[field] === undefined);
  if (missing.length) {
    errors.push({
      file: kind,
      row: header.labelRow + 1,
      message: `Column layout does not match the spec — missing ${missing.join(", ")}.`,
    });
    return [];
  }

  if (!header.blocks.length) {
    errors.push({
      file: kind,
      row: header.labelRow + 1,
      message: "No LANG/NAME column pair found — the file carries no names.",
    });
    return [];
  }

  const rows: FormRow[] = [];

  // Data starts below the label row and the [A]..[N] key row beneath it.
  for (let index = header.labelRow + 1; index < sheet.length; index += 1) {
    const raw = sheet[index] || [];
    const rowNumber = index + 1;

    const code = toInt(raw[header.identity.code!]);
    if (code === undefined) continue; // blank spacer, or the [A].. key row

    const values: Partial<Record<keyof FormRow, number | undefined>> = {};
    (
      ["checkList", "group", "subGroup", "action", "period", "index"] as Array<keyof FormRow>
    ).forEach((field) => {
      const column = header.identity[field];
      if (column !== undefined) values[field] = toInt(raw[column]);
    });

    const absent = REQUIRED[kind].filter((field) => values[field] === undefined);
    if (absent.length === REQUIRED[kind].length) {
      // CODE only: one of the empty template rows that pad the bottom of every file.
      continue;
    }
    if (absent.length) {
      errors.push({
        file: kind,
        row: rowNumber,
        message: `Incomplete row — ${absent.join(", ")} is blank.`,
      });
      continue;
    }

    const texts: FormText[] = [];
    header.blocks.forEach((block) => {
      const language = text(raw[block.lang]);
      const name = text(raw[block.name]);
      if (!language && !name) return; // a language the client left blank for this row

      if (!language) {
        warnings.push({
          file: kind,
          row: rowNumber,
          message: "A name is present with no language key — skipped.",
        });
        return;
      }
      if (!name) {
        warnings.push({
          file: kind,
          row: rowNumber,
          message: `Language ${language} has no name on this row — skipped.`,
        });
        return;
      }

      texts.push({
        language: language.toUpperCase(),
        name,
        type: block.type !== undefined ? text(raw[block.type]) || undefined : undefined,
        source: block.source !== undefined ? text(raw[block.source]) || undefined : undefined,
      });
    });

    if (!texts.length) {
      errors.push({ file: kind, row: rowNumber, message: "Row carries no name in any language." });
      continue;
    }

    rows.push({
      rowNumber,
      code,
      checkList: values.checkList!,
      group: values.group!,
      subGroup: values.subGroup,
      action: values.action,
      period: values.period,
      index: values.index,
      texts,
    });
  }

  if (!rows.length) {
    errors.push({ file: kind, message: "No data rows found." });
  }

  return rows;
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export type ParseOptions = {
  /**
   * Which CHECK-LIST template column to import. The Forms ship two (1 and 2) with
   * different names for group 4, and the spec never says how the value is chosen —
   * open question #7. Omit it to discover the available templates via `templates`,
   * then call again with a choice.
   */
  template?: number;
};

export const parseChecklistForms = (
  files: FormFiles,
  options: ParseOptions = {}
): ParseResult => {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];

  const form1 = parseForm("form1", files.form1, errors, warnings);
  const form2 = parseForm("form2", files.form2, errors, warnings);
  const form3 = parseForm("form3", files.form3, errors, warnings);
  const form4 = parseForm("form4", files.form4, errors, warnings);

  const templates = Array.from(
    new Set(form1.concat(form2, form3, form4).map((row) => row.checkList))
  ).sort((a, b) => a - b);

  if (errors.length) return { ok: false, errors, warnings, templates, data: null };

  const template = options.template ?? (templates.length === 1 ? templates[0] : undefined);
  if (template === undefined) {
    errors.push({
      file: "cross",
      message:
        `The files contain ${templates.length} check-list templates (${templates.join(", ")}). ` +
        "Pick one to import.",
    });
    return { ok: false, errors, warnings, templates, data: null };
  }
  if (!templates.includes(template)) {
    errors.push({
      file: "cross",
      message: `No rows for check-list template ${template}. Available: ${templates.join(", ")}.`,
    });
    return { ok: false, errors, warnings, templates, data: null };
  }

  const forTemplate = (rows: FormRow[]) => rows.filter((row) => row.checkList === template);
  const groupRows = forTemplate(form1);
  const subGroupRows = forTemplate(form2);
  const actionRows = forTemplate(form3);
  const valueRows = forTemplate(form4);

  // -- Duplicate identity tuples ------------------------------------------------
  const duplicates = (rows: FormRow[], kind: FormKind, key: (row: FormRow) => string) => {
    const seen = new Map<string, number>();
    rows.forEach((row) => {
      const id = key(row);
      const first = seen.get(id);
      if (first !== undefined) {
        errors.push({
          file: kind,
          row: row.rowNumber,
          message: `Duplicate of row ${first} — ${id} appears twice for this check-list.`,
        });
      } else {
        seen.set(id, row.rowNumber);
      }
    });
  };

  duplicates(groupRows, "form1", (r) => `group ${r.group}`);
  duplicates(subGroupRows, "form2", (r) => `group ${r.group} / sub-group ${r.subGroup}`);
  duplicates(actionRows, "form3", (r) => `${r.group}/${r.subGroup}/${r.action}`);
  duplicates(valueRows, "form4", (r) => `${r.group}/${r.subGroup}/${r.action} index ${r.index}`);

  // -- Referential integrity ----------------------------------------------------
  // Every child has to name a parent that exists, or the insert would fail on the
  // composite FKs. This is the check the sample bundle fails: Form4 references
  // GROUP=2 actions that Form3 does not define (docs/spec-inputs.md).
  const groupKeys = new Set(groupRows.map((r) => `${r.group}`));
  const subGroupKeys = new Set(subGroupRows.map((r) => `${r.group}/${r.subGroup}`));
  const actionKeys = new Set(actionRows.map((r) => `${r.group}/${r.subGroup}/${r.action}`));

  subGroupRows.forEach((row) => {
    if (!groupKeys.has(`${row.group}`)) {
      errors.push({
        file: "form2",
        row: row.rowNumber,
        message: `Group ${row.group} is not defined in Form1_Groups.`,
      });
    }
  });

  actionRows.forEach((row) => {
    if (!subGroupKeys.has(`${row.group}/${row.subGroup}`)) {
      errors.push({
        file: "form3",
        row: row.rowNumber,
        message: `Sub-group ${row.group}/${row.subGroup} is not defined in Form2_Sub_Groups.`,
      });
    }
  });

  valueRows.forEach((row) => {
    if (!actionKeys.has(`${row.group}/${row.subGroup}/${row.action}`)) {
      errors.push({
        file: "form4",
        row: row.rowNumber,
        message: `Action ${row.group}/${row.subGroup}/${row.action} is not defined in Form3_Actions.`,
      });
    }
  });

  // A template with no actions at all imports an empty tree — the check-list would be
  // useless and SF#088 must not be enabled for it. Fatal, not a warning.
  if (!actionRows.length) {
    errors.push({
      file: "form3",
      message:
        `Form3_Actions has no rows for check-list template ${template}, so the import ` +
        "would create a check-list with no actions.",
    });
  }

  // -- Non-fatal observations ---------------------------------------------------
  const withoutActions = subGroupRows.filter(
    (row) => !actionRows.some((a) => a.group === row.group && a.subGroup === row.subGroup)
  );
  if (withoutActions.length) {
    warnings.push({
      file: "cross",
      message: `${withoutActions.length} sub-group(s) have no actions and will import empty.`,
    });
  }

  if (errors.length) return { ok: false, errors, warnings, templates, data: null };

  // -- Build the tree -----------------------------------------------------------
  const data: ParsedChecklist = {
    template,
    groups: groupRows
      .sort((a, b) => a.group - b.group)
      .map((group) => ({
        code: group.group,
        texts: group.texts,
        subGroups: subGroupRows
          .filter((sub) => sub.group === group.group)
          .sort((a, b) => a.subGroup! - b.subGroup!)
          .map((sub) => ({
            code: sub.subGroup!,
            texts: sub.texts,
            actions: actionRows
              .filter((act) => act.group === sub.group && act.subGroup === sub.subGroup)
              .sort((a, b) => a.action! - b.action!)
              .map((act) => ({
                code: act.action!,
                period: act.period,
                texts: act.texts,
                values: valueRows
                  .filter(
                    (value) =>
                      value.group === act.group &&
                      value.subGroup === act.subGroup &&
                      value.action === act.action
                  )
                  .sort((a, b) => a.index! - b.index!)
                  .map((value) => ({ code: value.index!, texts: value.texts })),
              })),
          })),
      })),
  };

  return { ok: true, errors, warnings, templates, data };
};
