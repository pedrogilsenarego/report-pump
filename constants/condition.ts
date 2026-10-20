import { i18n } from "@/translations/i18n";

/**
 * `Condition` soft-delete domains (drawing p3, docs/data-model.md § Pre-set values). Nothing
 * in the spec deletes a row: it sets Condition, and every picker then hides the inactive
 * ones while the list reports (REPORT#01) still print them.
 */
export const CONDITION_ACTIVE = "1";

/** TECHNICIAN_CUST — Action#19 suspends with `Condition = 2`. */
export const TECHNICIAN_SUSPENDED = "2";

/** INSTALLATION — PopUp#28: Active / Exist but not Active / Deleted. */
export const INSTALLATION_CONDITIONS = ["1", "2", "3"] as const;

/**
 * Pickers hide only the codes known to be inactive. Rows written before the free-text
 * Condition input was replaced hold NULL or junk, and filtering on `= "1"` would hide them.
 */
export const isActiveTechnician = (condition?: string | null) =>
  String(condition ?? "").trim() !== TECHNICIAN_SUSPENDED;

export const isActiveInstallation = (condition?: string | null) => {
  const code = String(condition ?? "").trim();
  return code !== "2" && code !== "3";
};

export const technicianConditionLabel = (condition?: string | null): string => {
  const code = String(condition ?? "").trim();
  if (code === CONDITION_ACTIVE) return i18n.t("condition.active");
  if (code === TECHNICIAN_SUSPENDED) return i18n.t("condition.suspended");
  return code;
};

export const installationConditionLabel = (
  condition?: string | null
): string => {
  const code = String(condition ?? "").trim();
  return (INSTALLATION_CONDITIONS as readonly string[]).includes(code)
    ? i18n.t(`condition.installation.${code}`)
    : code;
};
