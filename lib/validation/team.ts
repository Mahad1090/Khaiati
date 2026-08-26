import { z } from "zod";

// A store owner (Manager) can add exactly one Storekeeper (supervisor) and
// one Accountant, plus any number of workers with a plain dashboard login.
// "employee" here is a worker-level login — distinct from the shop-floor
// Workers roster (business_employees), which has its own name/phone entries
// with no sign-in.
export const inviteableTeamRoles = ["employee", "storekeeper", "accountant"] as const;
export type InviteableTeamRole = (typeof inviteableTeamRoles)[number];

export const inviteEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(inviteableTeamRoles).default("employee"),
});
export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;
