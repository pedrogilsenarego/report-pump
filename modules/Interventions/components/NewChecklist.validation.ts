"use client";

import { z } from "zod";

export const NewCheklistSchema = z.object({
  date: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/, "Use the format yyyy.mm.dd"),
  name: z.string().min(1),
  nfpaEd: z.string().min(1),
  companyResp: z.string().optional(),
  nameResp: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export type NewChecklistType = z.infer<typeof NewCheklistSchema>;
