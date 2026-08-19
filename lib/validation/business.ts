import { z } from "zod";

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const businessRegistrationSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(150),
  ownerName: z.string().trim().min(2, "Owner name is required").max(150),
  contactEmail: z.string().trim().email("Enter a valid email address"),
  contactPhone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  location: z.string().trim().min(2, "Location is required").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type BusinessRegistrationInput = z.infer<typeof businessRegistrationSchema>;

export { slugify };

export const businessProfileSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(150),
  contactEmail: z.string().trim().email("Enter a valid email address"),
  contactPhone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  location: z.string().trim().min(2, "Location is required").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

export const businessStatuses = ["pending", "approved", "rejected", "suspended"] as const;
export type BusinessStatus = (typeof businessStatuses)[number];
export const businessStatusLabels: Record<BusinessStatus, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};
