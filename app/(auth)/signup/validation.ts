"use client";

import { z } from "zod";

export const SignupSchema = z
  .object({
    username: z.string(),
    address: z.string(),
    nameCompany: z.string(),
    defaultLang: z.string(),
    country: z.string(),
    role: z.string(),
    terms: z.boolean(),
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

    email: z
      .string()
      .email({
        message: "Invalid email address",
      })
      .min(1, {
        message: "The email is required",
      }),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupType = z.infer<typeof SignupSchema>;
