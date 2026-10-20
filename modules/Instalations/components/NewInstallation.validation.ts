"use client";

import { z } from "zod";

export const NewInstallationSchema = z.object({
  name: z.string(),

  address: z.string().optional(),
  area: z.string().optional(),
  responsibleId: z.string(),
});

export type NewInstallationType = z.infer<typeof NewInstallationSchema>;
