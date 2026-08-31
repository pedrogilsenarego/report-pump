import {
  ClAction,
  ClActionRaw,
  ClActionTextRaw,
  ClActionValue,
  ClActionValueRaw,
} from "@/types/clAction.types";
import { LocalizedName } from "@/types/group.types";
import { appLanguage, textRowsToLocalizedName } from "@/utils/specLanguage";

/**
 * cl_action_text carries three per-language strings per row (text / type / source), so it
 * cannot go through textRowsToLocalizedName, which collapses a single `text` column.
 * Same first-row-wins rule where several spec keys map to one app language (ENG/ENS/ENU).
 */
const pickField = (
  rows: ClActionTextRaw[] | null | undefined,
  field: "text" | "type" | "source"
): LocalizedName => {
  const name: LocalizedName = {};

  (rows || []).forEach((row) => {
    const value = row?.[field];
    if (!row?.language || !value) return;
    const key = appLanguage(row.language);
    if (!name[key]) name[key] = value;
  });

  return name;
};

const mapClActionValue = (raw: ClActionValueRaw): ClActionValue => ({
  id: raw.id,
  code: raw.code,
  label: textRowsToLocalizedName(raw.cl_values_text),
});

export const mapClAction = (raw: ClActionRaw): ClAction => ({
  id: raw.id,
  checklistId: raw.checklist_id,
  codeGroup: raw.code_gr,
  codeSubgroup: raw.code_sub_gr,
  code: raw.code,
  period: raw.period ?? undefined,
  pumpType: raw.pump_type ?? undefined,
  name: pickField(raw.cl_action_text, "text"),
  type: pickField(raw.cl_action_text, "type"),
  source: pickField(raw.cl_action_text, "source"),
  // Measurement slots are ordered by their INDEX so "after start / 10 min / 15 min"
  // renders in the order the form asks for them.
  values: (raw.cl_action_values || [])
    .map(mapClActionValue)
    .sort((a, b) => a.code - b.code),
});

export const mapClActions = (raw: ClActionRaw[]): ClAction[] =>
  (raw || []).map(mapClAction);
