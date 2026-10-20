import { i18n } from "@/translations/i18n";

/**
 * PUMP_GROUP pre-set values (drawing p3, see docs/data-model.md § Pre-set values).
 *
 * `Type` filters CL_ACTION.Pump_Type when an intervention's action list is built, so it must
 * only ever hold one of these codes. It used to be a free-text input, which let rows with
 * `type = "teste"` in — those match no action at all.
 */
export const PUMP_TYPES = ["J", "E", "D"] as const;

/** REPORT#02 / #03 print the expansion, not the code. */
export const PUMP_SUB_TYPES = ["H-ES", "H-SC", "VT", "V-IL", "VT-MS"] as const;

/**
 * Condition "1" is Active under every reading of the spec. Inactive is `2` on p3 but `0` on
 * sheets 5/6 and 6/6 — unresolved, so nothing here writes an inactive value yet.
 */
export const PUMP_CONDITION_ACTIVE = "1";

export type PumpTypeCode = (typeof PUMP_TYPES)[number];
export type PumpSubTypeCode = (typeof PUMP_SUB_TYPES)[number];

export const pumpTypeLabel = (code?: string | null): string =>
  code && (PUMP_TYPES as readonly string[]).includes(code)
    ? i18n.t(`pumpGroup.typeValue.${code}`)
    : code ?? "";

export const pumpSubTypeLabel = (code?: string | null): string =>
  code && (PUMP_SUB_TYPES as readonly string[]).includes(code)
    ? i18n.t(`pumpGroup.subTypeValue.${code}`)
    : code ?? "";
