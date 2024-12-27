"use client";

import { z } from "zod";

export const NewCheklistSchema = z.object({
  nfpaEd: z.string(),
});

export type NewChecklistType = z.infer<typeof NewCheklistSchema>;
