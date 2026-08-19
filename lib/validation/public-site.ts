import { z } from "zod";
import { garmentTypes } from "./design";

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(150),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  garment_type: z.enum(garmentTypes).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;
