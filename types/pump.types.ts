/**
 * Pump groups (spec table PUMP_GROUP) — the `pumps` table.
 *
 * The DB already carries the full six-block field set from Screen#13 (PUMP / MOTOR /
 * CONTROLLER / COUPLING / GEARBOX / VT PUMPS); only the fields the UI reads are typed
 * here so far. See docs/data-model.md and docs/reports-outputs.md REPORT#02.
 */
export type Pump = {
  // pumps.id is a bigint too — see the note on Checklist.id.
  id: number;
  createdAt: string;
  installationId?: string;
  /** PUMP_GROUP.Type — J (jockey) / E (electric) / D (diesel). Filters CL_ACTION.Pump_Type. */
  type?: string;
  /** PUMP_GROUP.Sub_Type — H-ES / H-SC / VT / V-IL / VT-MS. */
  subType?: string;
  condition?: string;
  installations?: {
    name?: string;
  };
};

export type PumpRaw = {
  id: number;
  created_at: string;
  installation_id?: string;
  type?: string;
  sub_type?: string;
  condition?: string;
  installations?: {
    name?: string;
  };
};
