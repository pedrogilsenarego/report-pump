"use client";

import { z } from "zod";

export const NewTechnicianSchema = z.object({
  name: z.string(),
  language: z.string().optional(),
  function: z.string().optional(),
  role: z.string(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^\+?\d{1,3}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
          val
        ),
      {
        message: "Invalid phone number format",
      }
    ),
  email: z.string().email({
    message: "Invalid email address",
  }),

  certification: z.string().optional(),
  condition: z.string().optional(),
  confirmPassword: z.string({
    required_error: "The validation password is required",
  }),

  password: z
    .string({
      required_error: "The password is required",
    })
    .min(
      8,

      "The password is to short"
    ),
});

export type NewTechnicianType = z.infer<typeof NewTechnicianSchema>;
