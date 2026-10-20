/**
 * Pump groups (spec table PUMP_GROUP) — the `pumps` table.
 *
 * The six blocks of Screen#13/#14 and REPORT#02: PUMP / MOTOR / CONTROLLER / COUPLING /
 * GEARBOX / VT PUMPS. See docs/data-model.md and docs/reports-outputs.md REPORT#02.
 *
 * The spec lists `Ctrl_TAG` twice (S(8) and S(5)); the second is probably a controller S/N,
 * which has no column yet. Only one `ctrlTag` is modelled until the client confirms.
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
  pumpTag?: string;
  pumpBrand?: string;
  pumpModel?: string;
  pumpSn?: string;
  motorTag?: string;
  motorBrand?: string;
  motorModel?: string;
  motorSn?: string;
  ctrlTag?: string;
  ctrlBrand?: string;
  ctrlModel?: string;
  ctrlType?: string;
  /** COUPLING / GEARBOX / VT PUMPS print only when these are non-empty — stored as NULL. */
  couplingBrand?: string;
  couplingModel?: string;
  couplingSn?: string;
  gearbBrand?: string;
  gearbModel?: string;
  gearbSn?: string;
  columnLength?: string;
  nrStages?: number;
  installations?: {
    name?: string;
  };
};

export type PumpRaw = {
  id: number;
  created_at: string;
  installation_id?: string;
  type?: string;
  sub_type?: string | null;
  condition?: string;
  pump_tag?: string | null;
  pump_brand?: string | null;
  pump_model?: string | null;
  pump_sn?: string | null;
  motor_tag?: string | null;
  motor_brand?: string | null;
  motor_model?: string | null;
  motor_sn?: string | null;
  ctrl_tag?: string | null;
  ctrl_brand?: string | null;
  ctrl_model?: string | null;
  ctrl_type?: string | null;
  coupling_brand?: string | null;
  coupling_model?: string | null;
  coupling_sn?: string | null;
  gearb_brand?: string | null;
  gearb_model?: string | null;
  gearb_sn?: string | null;
  column_length?: string | null;
  nr_stages?: number | null;
  installations?: {
    name?: string;
  };
};
