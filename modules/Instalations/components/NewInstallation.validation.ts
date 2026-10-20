"use client";

import { z } from "zod";
import { i18n } from "@/translations/i18n";

export const NewInstallationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: i18n.t("pumpGroup.required") })
    .max(99),
  address: z.string().max(99).optional(),
  area: z.string().max(99).optional(),
  responsibleId: z.string().min(1, { message: i18n.t("pumpGroup.required") }),
});

export type NewInstallationType = z.infer<typeof NewInstallationSchema>;
