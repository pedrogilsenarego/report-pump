import { i18n } from "@/translations/i18n";

/**
 * PERIODICITY (Table_Peridiocity.xlsx, spec table PERIODICITY / MAINT_TYPE).
 *
 * Codes are 1-based and ascend from MOST to LEAST frequent. This matters twice over:
 * `CL_ACTION.Period` holds one of these codes, and a round of periodicity n includes every
 * action whose period is <= n (see isDueForPeriod in utils/checklist.ts).
 *
 * This replaces the previous 0-based `periodValues` array
 * (["bianual","anual","trimester","semester","monthly","weekend"]), which had both the
 * wrong base and the wrong order, so every period label rendered was incorrect.
 *
 * These are hardcoded because Action#23 (Update Periodicity Table) is not built yet — the
 * eight rows come from the client's spreadsheet and belong in a `periodicity` table once
 * that upload exists. See docs/TODO.md.
 */
export const PERIODICITY = [
  { code: 1, key: "weekly" },
  { code: 2, key: "monthly" },
  { code: 3, key: "quarterly" },
  { code: 4, key: "semestrally" },
  { code: 5, key: "annually" },
  { code: 6, key: "biAnnually" },
  { code: 7, key: "threeAnnually" },
  { code: 8, key: "fiveAnnually" },
] as const;

export const periodLabel = (code?: number | string | null): string => {
  if (code == null || code === "") return "";
  const entry = PERIODICITY.find((row) => row.code === Number(code));
  return entry ? i18n.t(`periodicity.${entry.key}`) : String(code);
};
