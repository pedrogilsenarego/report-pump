import { LocalizedName, TextRaw } from "./group.types";

/**
 * Check-list template actions (spec tables CL_ACTION / CL_ACTION_TEXT and
 * CL_ACTION_VALUES / CL_VALUES_TEXT), as imported by Action#04.
 *
 * These replace the pre-import `actions` catalog + `checklistactions` join. Like groups
 * and sub-groups they are PER CHECK-LIST, so `code` is only unique within
 * (checklistId, codeGroup, codeSubgroup).
 *
 * Three things are per-language and therefore live in cl_action_text, not on the action:
 * the name, `type` (the localized group abbreviation — IPE in PTG, PTI in ENG) and
 * `source` (the NFPA-25 clause, or "Instruções do Fabricante" / "Mnfct instructions").
 * That is why the old single-language `actions.description` could not be reused.
 */

/**
 * One measurement slot on an action (CL_ACTION_VALUES).
 *
 * An action is not just pass/fail: it can carry n numeric readings, each with its own
 * localized label. `label` is a field caption WITH its unit ("Valor (bar):", "RPM (Após
 * 10 min):") — the unit is baked into the string, it is not a separate field.
 */
export type ClActionValue = {
  id: number;
  /** [F] INDEX in Form4_Measurements.xlsx — the slot number, 1-based. */
  code: number;
  label: LocalizedName;
};

export type ClAction = {
  id: number;
  checklistId: number;
  codeGroup: number;
  codeSubgroup: number;
  code: number;
  /** PERIODICITY code: 1 = Weekly, 2 = Monthly, ... 8 = 5-Annually. */
  period?: number;
  /** CL_ACTION.Pump_Type — filters the action by PUMP_GROUP.Type (J/E/D). */
  pumpType?: string;
  name: LocalizedName;
  type: LocalizedName;
  source: LocalizedName;
  values: ClActionValue[];
};

export type ClActionTextRaw = {
  language: string;
  type: string | null;
  source: string | null;
  text: string;
};

export type ClActionValueRaw = {
  id: number;
  code: number;
  cl_values_text?: TextRaw[] | null;
};

export type ClActionRaw = {
  id: number;
  checklist_id: number;
  code_gr: number;
  code_sub_gr: number;
  code: number;
  period: number | null;
  pump_type: string | null;
  cl_action_text?: ClActionTextRaw[] | null;
  cl_action_values?: ClActionValueRaw[] | null;
};
