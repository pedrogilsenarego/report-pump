import { i18n } from "@/translations/i18n";
import { SPEC_FIELDS } from "./specFields";

/**
 * The spec's label for ScreenField `n` (SF#nnn) in the current UI language.
 *
 * Falls back to English, then Portuguese — 15 fields in the workbook have English only, and
 * FR / ES are empty until the client fills them. An unknown number returns "" rather than
 * throwing, so a typo shows up as a missing label, not a crash.
 *
 * Feature strings that have no SF# (toasts, hints) stay in languages/*.ts; this is for
 * labels the spec numbers.
 */
export const sf = (n: number): string => {
  const field = SPEC_FIELDS[n];
  if (!field) return "";
  const lang = (i18n.language || "pt").slice(0, 2) as "pt" | "en" | "fr" | "es";
  return field[lang] || field.en || field.pt || "";
};
