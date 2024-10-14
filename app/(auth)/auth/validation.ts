"use client";

import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SigninType = z.infer<typeof SignInSchema>;
