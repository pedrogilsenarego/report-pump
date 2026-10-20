import { Installation, InstallationRaw } from "@/types/installation.types";
import { Pump, PumpRaw } from "@/types/pump.types";
import { PUMP_CONDITION_ACTIVE } from "@/constants/pumpGroup";
import { NewPumpType } from "@/modules/Pumps/components/NewPump.validation";

export const mapInstallation = (profile: InstallationRaw): Installation => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
    name: profile.name,
    condition: profile.condition,
    area: profile.area,
    address: profile.address,
    companyId: profile.company_id,
    responsibleId: profile.responsible_id,
    responsibleName: profile.profiles?.display_name,
  };
};

/**
 * Empty inputs are written as NULL, not "": REPORT#02 prints the COUPLING / GEARBOX /
 * VT PUMPS blocks only when their brand / column length is set.
 */
const orNull = (value?: string) => (value ? value : null);

/** Condition is not on Screen#13 — a new pump group is Active; edits leave it alone. */
export const mapPumpToRaw = (
  pump: NewPumpType
): Omit<PumpRaw, "created_at" | "id" | "condition" | "installations"> => {
  return {
    installation_id: pump.installationId,
    type: pump.type,
    sub_type: pump.subType,
    pump_tag: orNull(pump.pumpTag),
    pump_brand: pump.pumpBrand,
    pump_model: pump.pumpModel,
    pump_sn: pump.pumpSn,
    motor_tag: orNull(pump.motorTag),
    motor_brand: pump.motorBrand,
    motor_model: orNull(pump.motorModel),
    motor_sn: pump.motorSn,
    ctrl_tag: orNull(pump.ctrlTag),
    ctrl_brand: pump.ctrlBrand,
    ctrl_model: orNull(pump.ctrlModel),
    ctrl_type: orNull(pump.ctrlType),
    coupling_brand: orNull(pump.couplingBrand),
    coupling_model: orNull(pump.couplingModel),
    coupling_sn: orNull(pump.couplingSn),
    gearb_brand: orNull(pump.gearbBrand),
    gearb_model: orNull(pump.gearbModel),
    gearb_sn: orNull(pump.gearbSn),
    column_length: orNull(pump.columnLength),
    nr_stages: pump.nrStages ? Number(pump.nrStages) : null,
  };
};

export const mapNewPumpToRaw = (pump: NewPumpType) => ({
  ...mapPumpToRaw(pump),
  condition: PUMP_CONDITION_ACTIVE,
});

/** The inverse, to seed the Screen#14 edit form. */
export const mapPumpToForm = (pump: Pump): Partial<NewPumpType> => ({
  installationId: pump.installationId ? String(pump.installationId) : "",
  type: pump.type as NewPumpType["type"],
  subType: pump.subType as NewPumpType["subType"],
  pumpTag: pump.pumpTag ?? "",
  pumpBrand: pump.pumpBrand ?? "",
  pumpModel: pump.pumpModel ?? "",
  pumpSn: pump.pumpSn ?? "",
  motorTag: pump.motorTag ?? "",
  motorBrand: pump.motorBrand ?? "",
  motorModel: pump.motorModel ?? "",
  motorSn: pump.motorSn ?? "",
  ctrlTag: pump.ctrlTag ?? "",
  ctrlBrand: pump.ctrlBrand ?? "",
  ctrlModel: pump.ctrlModel ?? "",
  ctrlType: pump.ctrlType ?? "",
  couplingBrand: pump.couplingBrand ?? "",
  couplingModel: pump.couplingModel ?? "",
  couplingSn: pump.couplingSn ?? "",
  gearbBrand: pump.gearbBrand ?? "",
  gearbModel: pump.gearbModel ?? "",
  gearbSn: pump.gearbSn ?? "",
  columnLength: pump.columnLength ?? "",
  nrStages: pump.nrStages != null ? String(pump.nrStages) : "",
});

export const mapInstallations = (profiles: InstallationRaw[]): Installation[] =>
  profiles.map((profile) => mapInstallation(profile));

/**
 * getPumps used to resolve the raw Supabase rows straight through, so every pump reached
 * the UI with `installation_id` and no `installationId`. The New Intervention pump-group
 * filter compares `String(pump.installationId) === installationId`, which was therefore
 * always "undefined" — picking an installation emptied the list and the screen showed
 * "There are no Pump Groups defined for this Installation!" even when one existed.
 */
export const mapPump = (profile: PumpRaw): Pump => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
    installationId: profile.installation_id,
    type: profile.type,
    subType: profile.sub_type ?? undefined,
    condition: profile.condition,
    pumpTag: profile.pump_tag ?? undefined,
    pumpBrand: profile.pump_brand ?? undefined,
    pumpModel: profile.pump_model ?? undefined,
    pumpSn: profile.pump_sn ?? undefined,
    motorTag: profile.motor_tag ?? undefined,
    motorBrand: profile.motor_brand ?? undefined,
    motorModel: profile.motor_model ?? undefined,
    motorSn: profile.motor_sn ?? undefined,
    ctrlTag: profile.ctrl_tag ?? undefined,
    ctrlBrand: profile.ctrl_brand ?? undefined,
    ctrlModel: profile.ctrl_model ?? undefined,
    ctrlType: profile.ctrl_type ?? undefined,
    couplingBrand: profile.coupling_brand ?? undefined,
    couplingModel: profile.coupling_model ?? undefined,
    couplingSn: profile.coupling_sn ?? undefined,
    gearbBrand: profile.gearb_brand ?? undefined,
    gearbModel: profile.gearb_model ?? undefined,
    gearbSn: profile.gearb_sn ?? undefined,
    columnLength: profile.column_length ?? undefined,
    nrStages: profile.nr_stages ?? undefined,
    installations: profile.installations,
  };
};

export const mapPumps = (profiles: PumpRaw[]): Pump[] =>
  profiles.map((profile) => mapPump(profile));
