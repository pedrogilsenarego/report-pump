"use client";

import { z } from "zod";

export const NewActionSchema = z.object({
  description: z.string(),
  period: z.string(),
});

export type NewActionType = z.infer<typeof NewActionSchema>;
