import { ClAction, ClActionValue } from "./clAction.types";
import { LocalizedName } from "./group.types";

/**
 * Intervention = one execution of a check-list against one pump group (spec table
 * INTERVENTION plus INT_RESULT / INT_NOTES / MEASUREMENTS / TECHNICIAN_INT1-2).
 *
 * See docs/screens-flows.md § "Interventions — the lifecycle" for the four entry points
 * (Create New / Finalise existing / View existing / Print) and docs/data-model.md for the
 * field list.
 */

/**
 * INT_RESULT.Result. p3's pre-set table gives V = Ok, X = Fail, - = See notes.
 * Sheet 5/6 also uses a fourth value `*` that p3 does not document (docs/spec-inputs.md
 * Q8), so it is accepted rather than rejected — data we were told to expect.
 */
export const ResultCodes = {
  OK: "V",
  FAIL: "X",
  SEE_NOTES: "-",
  UNDOCUMENTED: "*",
} as const;

export type ResultCode = (typeof ResultCodes)[keyof typeof ResultCodes];

/** INTERVENTION.Locked: only a locked intervention can be printed (sheet 5/6). */
export type Intervention = {
  id?: number;
  code?: number;
  createdAt?: string;
  userId?: string;
  checklistId?: number;
  installationId?: string;
  pumpId?: string;
  dateStart?: string;
  dateEnd?: string;
  refMonth?: string;
  processRef?: string;
  language?: string;
  period?: number;
  controlerStatus?: string;
  verifyedBy?: string;
  responsable?: string;
  dateReport?: string;
  locked: boolean;
};

export type InterventionRaw = {
  id?: number;
  code?: number;
  created_at?: string;
  user_id?: string;
  checklist_id?: number;
  installation_id?: string;
  pump_id?: string;
  date_start?: string;
  date_end?: string;
  ref_month?: string;
  process_ref?: string;
  language?: string;
  period?: number;
  controler_status?: string;
  verifyed_by?: string;
  responsable?: string;
  date_report?: string;
  locked?: boolean;
};

/** One recorded measurement, paired back with the slot label it was taken against. */
export type RecordedMeasurement = {
  codeValues: number;
  value: number | null;
  /** From cl_action_values; empty when a re-import dropped the slot. */
  label: LocalizedName;
};

/**
 * One answered action on the report.
 *
 * `clActionId` is null when a template re-import dropped the action. The composite codes
 * and the recorded result survive regardless — that is the whole point of the snapshot
 * columns on int_result (see the migration header). `name` is empty in that case, so the
 * report degrades to the bare code rather than losing the answer.
 */
export type InterventionResult = {
  id: number;
  clActionId: number | null;
  checklistId: number;
  codeGroup: number;
  codeSubgroup: number;
  code: number;
  result: ResultCode;
  notes: string[];
  measurements: RecordedMeasurement[];
  name: LocalizedName;
  type: LocalizedName;
  source: LocalizedName;
  period?: number;
  pumpType?: string;
  /** True when the template row behind this answer no longer exists. */
  orphaned: boolean;
};

/** One row of intervention_technicians (spec TECHNICIAN_INT1 / TECHNICIAN_INT2). */
export type InterventionTechnician = {
  slot: 1 | 2;
  profileId: string;
  name?: string;
};

export type InterventionDetail = {
  intervention: Intervention;
  results: InterventionResult[];
  /** INT_NOTES rows with no int_result_id — the spec's Code_Interv_Result = 0 case. */
  generalNotes: string[];
  technicians: InterventionTechnician[];
};

/** What the New Intervention form collects for one action before it is saved. */
export type AnswerDraft = {
  action: ClAction;
  result?: ResultCode;
  note?: string;
  /** Keyed by ClActionValue.code. */
  measurements: Record<number, string>;
};

/** The INTERVENTION header fields collected alongside the answers. */
export type InterventionHeaderDraft = {
  controlerStatus?: string;
  refMonth?: string;
  /** Must name one of the technicians below — spec note [1] on INTERVENTION. */
  verifyedBy?: string;
  responsable?: string;
  /** profiles.id for slot 1 / slot 2, or "" for none. */
  technician1?: string;
  technician2?: string;
};

export type NewInterventionInput = InterventionHeaderDraft & {
  checklistId: number;
  installationId: string;
  pumpId?: string;
  period?: number;
  answers: AnswerDraft[];
  /** "Add additional notes?" — one free-standing INT_NOTES row. */
  generalNote?: string;
  /** "Save and lock Report?" */
  lock?: boolean;
};

/** Finalise existing — the same payload against an intervention that already exists. */
export type UpdateInterventionInput = InterventionHeaderDraft & {
  interventionId: number;
  answers: AnswerDraft[];
  generalNote?: string;
  lock?: boolean;
};

export type { ClAction, ClActionValue };
