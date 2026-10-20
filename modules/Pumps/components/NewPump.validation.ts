"use client";

import { z } from "zod";
import { PUMP_SUB_TYPES, PUMP_TYPES } from "@/constants/pumpGroup";
import { i18n } from "@/translations/i18n";

/**
 * Screen#13 / #14 — field lengths and (*) required marks from PUMP_GROUP in
 * docs/data-model.md. Sub_Type is (*) on the screen though not on the table.
 */
const required = (max: number) =>
  z
    .string()
    .trim()
    .min(1, { message: i18n.t("pumpGroup.required") })
    .max(max, { message: i18n.t("pumpGroup.maxLength", { max }) });

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: i18n.t("pumpGroup.maxLength", { max }) })
    .optional();

export const NewPumpSchema = z.object({
  installationId: z.string().min(1, { message: i18n.t("pumpGroup.required") }),
  type: z.enum(PUMP_TYPES, { message: i18n.t("pumpGroup.required") }),
  subType: z.enum(PUMP_SUB_TYPES, { message: i18n.t("pumpGroup.required") }),
  pumpTag: optional(8),
  pumpBrand: required(15),
  pumpModel: required(10),
  pumpSn: required(20),
  motorTag: optional(8),
  motorBrand: required(15),
  motorModel: optional(10),
  motorSn: required(20),
  ctrlTag: optional(8),
  ctrlBrand: required(15),
  ctrlModel: optional(10),
  ctrlType: optional(5),
  couplingBrand: optional(15),
  couplingModel: optional(10),
  couplingSn: optional(20),
  gearbBrand: optional(15),
  gearbModel: optional(10),
  gearbSn: optional(20),
  columnLength: optional(10),
  nrStages: z
    .string()
    .trim()
    .regex(/^\d{0,2}$/, { message: i18n.t("pumpGroup.nrStagesInvalid") })
    .optional(),
});

export type NewPumpType = z.infer<typeof NewPumpSchema>;
