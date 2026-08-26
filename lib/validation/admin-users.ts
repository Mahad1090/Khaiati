import { z } from "zod";

export const inviteAdministratorSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type InviteAdministratorInput = z.infer<typeof inviteAdministratorSchema>;
