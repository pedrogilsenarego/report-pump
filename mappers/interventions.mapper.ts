/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClAction } from "@/types/clAction.types";
import {
  Intervention,
  InterventionRaw,
  InterventionResult,
  ResultCode,
} from "@/types/interventions.types";

export const mapIntervention = (raw: InterventionRaw): Intervention => ({
  id: raw.id,
  code: raw.code,
  createdAt: raw.created_at,
  userId: raw.user_id,
  checklistId: raw.checklist_id,
  installationId: raw.installation_id,
  pumpId: raw.pump_id,
  dateStart: raw.date_start,
  dateEnd: raw.date_end,
  refMonth: raw.ref_month,
  processRef: raw.process_ref,
  language: raw.language,
  period: raw.period,
  controlerStatus: raw.controler_status,
  verifyedBy: raw.verifyed_by,
  responsable: raw.responsable,
  dateReport: raw.date_report,
  // Defaulting to false rather than undefined keeps the print gate fail-closed if the
  // column is ever missing from a select.
  locked: raw.locked ?? false,
});

export const mapInterventions = (raw: InterventionRaw[]): Intervention[] =>
  (raw || []).map(mapIntervention);

export const mapInterventionToRaw = (
  intervention: Intervention
): InterventionRaw => ({
  user_id: intervention.userId,
  installation_id: intervention.installationId,
  checklist_id: intervention.checklistId,
  pump_id: intervention.pumpId,
  period: intervention.period,
  date_start: intervention.dateStart,
  date_end: intervention.dateEnd,
  ref_month: intervention.refMonth,
  language: intervention.language,
  controler_status: intervention.controlerStatus,
  verifyed_by: intervention.verifyedBy,
  responsable: intervention.responsable,
  locked: intervention.locked,
});

type IntResultRaw = {
  id: number;
  cl_action_id: number | null;
  checklist_id: number;
  code_gr: number;
  code_sub_gr: number;
  code_action: number;
  result: string;
};

type MeasurementRaw = {
  code_gr: number;
  code_sub_gr: number;
  code_action: number;
  code_values: number;
  value: number | string | null;
};

type NoteRaw = {
  int_result_id: number | null;
  text: string;
};

const actionKey = (
  codeGroup: number,
  codeSubgroup: number,
  code: number
): string => `${codeGroup}.${codeSubgroup}.${code}`;

/**
 * Joins recorded answers back onto the template.
 *
 * The join is by the SNAPSHOT CODES, not by cl_action_id, so an answer whose template row
 * was dropped by a re-import still lands in the right place in the report — it just has no
 * name. Doing it the other way round would silently drop real field data from the output.
 */
export const mapInterventionResults = (
  results: IntResultRaw[],
  measurements: MeasurementRaw[],
  notes: NoteRaw[],
  actions: ClAction[]
): InterventionResult[] => {
  const actionsByKey = new Map<string, ClAction>();
  actions.forEach((action) =>
    actionsByKey.set(
      actionKey(action.codeGroup, action.codeSubgroup, action.code),
      action
    )
  );

  const notesByResult = new Map<number, string[]>();
  (notes || []).forEach((note) => {
    if (note.int_result_id == null) return;
    const list = notesByResult.get(note.int_result_id) || [];
    list.push(note.text);
    notesByResult.set(note.int_result_id, list);
  });

  const measurementsByKey = new Map<string, MeasurementRaw[]>();
  (measurements || []).forEach((row) => {
    const key = actionKey(row.code_gr, row.code_sub_gr, row.code_action);
    const list = measurementsByKey.get(key) || [];
    list.push(row);
    measurementsByKey.set(key, list);
  });

  return (results || []).map((row) => {
    const key = actionKey(row.code_gr, row.code_sub_gr, row.code_action);
    const action = actionsByKey.get(key);

    return {
      id: row.id,
      clActionId: row.cl_action_id,
      checklistId: row.checklist_id,
      codeGroup: row.code_gr,
      codeSubgroup: row.code_sub_gr,
      code: row.code_action,
      result: row.result as ResultCode,
      notes: notesByResult.get(row.id) || [],
      measurements: (measurementsByKey.get(key) || [])
        .sort((a, b) => a.code_values - b.code_values)
        .map((measurement) => ({
          codeValues: measurement.code_values,
          // numeric(7,1) comes back from PostgREST as a string.
          value:
            measurement.value == null ? null : Number(measurement.value),
          label:
            action?.values.find((slot) => slot.code === measurement.code_values)
              ?.label || {},
        })),
      name: action?.name || {},
      type: action?.type || {},
      source: action?.source || {},
      period: action?.period,
      pumpType: action?.pumpType,
      orphaned: !action,
    };
  });
};
