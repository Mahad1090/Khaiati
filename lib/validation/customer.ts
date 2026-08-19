import { z } from "zod";

// Loose but real phone validation: digits, spaces, +, -, parens, 7-20 chars.
const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(150),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number"),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
