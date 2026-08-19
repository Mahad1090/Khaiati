import { z } from "zod";

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export const customerRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

export const customerLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
