"use client";

import { z } from "zod";

/**
 * The spec keys an intervention on (Code, Code_Pump_Gr, Code_Inst, Code_Customer) and every
 * REPORTS entry on sheet 5/6 walks Installation -> Pump Group -> Intervention, so the pump
 * group is required, not optional.
 */
export const NewInterventionSchema = z.object({
  checklistId: z.string(),
  installationId: z.string(),
  pumpId: z.string(),
  period: z.string(),
});

export type NewInterventionType = z.infer<typeof NewInterventionSchema>;
