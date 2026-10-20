/**
 * Parsers for the two reference workbooks the administrator uploads (Screen#03):
 *
 *   Action#22  Table_Language.xlsx     CODE | NAME | COUNTRY | FLAG
 *   Action#23  Table_Peridiocity.xlsx  CODE | LANG1 | TEXT1 | LANG2 | TEXT2 | ...
 *
 * Both workbooks open with a title block (company, file, date) whose height differs between
 * them, so data is located by its `CODE` header row rather than a fixed row number
 * (docs/spec-inputs.md). Blank rows are skipped, and so are rows that carry only a number in
 * column A — Table_Language.xlsx pre-numbers its empty trailing rows 8, 9, 10, ...
 *
 * Pure: no database access. The route decides what to do with the result; a workbook with
 * any error is rejected whole, so a bad upload can never half-replace a table.
 */

import * as XLSX from "xlsx";

export type LanguageRow = {
  code: string;
  name: string;
  country: string | null;
  flag: string | null;
};

export type PeriodicityRow = { code: number; language: string; text: string };

export type ParseResult<T> = { rows: T[]; errors: string[] };

const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();

/** Rows after the `CODE` header, each tagged with its 1-based sheet row for messages. */
const dataRows = (
  buffer: ArrayBuffer
): { rows: { line: number; cells: string[] }[]; error?: string } => {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    return { rows: [], error: "The file is not a readable Excel workbook." };
  }
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const all = XLSX.utils
    .sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" })
    .map((cells) => (cells as unknown[]).map(clean));

  const header = all.findIndex((cells) => cells[0]?.toUpperCase() === "CODE");
  if (header < 0) {
    return { rows: [], error: 'No header row starting with "CODE" was found.' };
  }

  const rows = all
    .map((cells, index) => ({ line: index + 1, cells }))
    .slice(header + 1)
    // Blank, or only a running number in column A.
    .filter(({ cells }) => cells.slice(1).some(Boolean));

  return { rows };
};

const LANGUAGE_CODE = /^[A-Z]{3}$/;

export const parseLanguages = (buffer: ArrayBuffer): ParseResult<LanguageRow> => {
  const { rows, error } = dataRows(buffer);
  if (error) return { rows: [], errors: [error] };

  const errors: string[] = [];
  const seen = new Set<string>();
  const out: LanguageRow[] = [];

  for (const { line, cells } of rows) {
    const [rawCode, name, country, flag] = cells;
    const code = rawCode.toUpperCase();
    if (!LANGUAGE_CODE.test(code)) {
      errors.push(`Row ${line}: CODE "${rawCode}" is not a 3-letter code.`);
      continue;
    }
    if (!name) errors.push(`Row ${line}: ${code} has no NAME.`);
    if (seen.has(code)) errors.push(`Row ${line}: ${code} appears more than once.`);
    seen.add(code);
    out.push({ code, name, country: country || null, flag: flag || null });
  }

  if (!out.length && !errors.length) errors.push("The workbook has no language rows.");
  return { rows: out, errors };
};

export const parsePeriodicity = (
  buffer: ArrayBuffer
): ParseResult<PeriodicityRow> => {
  const { rows, error } = dataRows(buffer);
  if (error) return { rows: [], errors: [error] };

  const errors: string[] = [];
  const seen = new Set<string>();
  const out: PeriodicityRow[] = [];

  for (const { line, cells } of rows) {
    const code = Number(cells[0]);
    // CL_ACTION.Period is S(1): a single digit.
    if (!Number.isInteger(code) || code < 1 || code > 9) {
      errors.push(`Row ${line}: CODE "${cells[0]}" is not a number from 1 to 9.`);
      continue;
    }
    // LANGn / TEXTn pairs from column B onwards — as many as the file has.
    let pairs = 0;
    for (let i = 1; i + 1 < cells.length; i += 2) {
      const language = cells[i].toUpperCase();
      const text = cells[i + 1];
      if (!language && !text) continue;
      if (!LANGUAGE_CODE.test(language)) {
        errors.push(`Row ${line}: "${cells[i]}" is not a 3-letter language code.`);
        continue;
      }
      if (!text) {
        errors.push(`Row ${line}: code ${code} has no text for ${language}.`);
        continue;
      }
      const key = `${code}:${language}`;
      if (seen.has(key)) errors.push(`Row ${line}: code ${code} / ${language} repeats.`);
      seen.add(key);
      out.push({ code, language, text });
      pairs += 1;
    }
    if (!pairs) errors.push(`Row ${line}: code ${code} has no language / text pair.`);
  }

  if (!out.length && !errors.length) errors.push("The workbook has no periodicity rows.");
  return { rows: out, errors };
};
