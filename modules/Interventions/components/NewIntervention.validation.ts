"use client";

import { z } from "zod";

export const NewInterventionSchema = z.object({
  checklistId: z.string(),
  installationId: z.string(),
});

export type NewInterventionType = z.infer<typeof NewInterventionSchema>;
