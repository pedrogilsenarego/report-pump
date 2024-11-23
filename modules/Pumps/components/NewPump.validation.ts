"use client";

import { z } from "zod";

export const NewPumpSchema = z.object({
  type: z.string(),
  condition: z.string().optional(),
  installationId: z.string().optional(),
});

export type NewPumpType = z.infer<typeof NewPumpSchema>;
