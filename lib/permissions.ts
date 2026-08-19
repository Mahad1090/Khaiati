// Role → capability matrix for the Khaiati management system.
//
// This defines the intended permission model per the requirements doc. It is
// NOT yet enforced on every server action — that requires resolving the
// signed-in user's role from Supabase Auth on each request, which needs a
// real Supabase project (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)
// to test against. Once auth is wired (see getCurrentUserRole below), guard
// mutating actions with `can(role, "orders:delete")` etc. before the query runs.

export const roles = ["administrator", "manager", "accountant", "storekeeper", "employee"] as const;
export type Role = (typeof roles)[number];

export const roleLabels: Record<Role, string> = {
  administrator: "Administrator",
  manager: "Manager",
  accountant: "Accountant",
  storekeeper: "Storekeeper",
  employee: "Employee",
};

export type Capability =
  | "customers:view"
  | "customers:edit"
  | "orders:view"
  | "orders:edit"
  | "orders:delete"
  | "workers:view"
  | "workers:edit"
  | "payroll:edit" // salaries, wages, advances
  | "fabrics:view"
  | "fabrics:edit"
  | "purchases:edit"
  | "sales:edit"
  | "finance:view"
  | "finance:edit"
  | "reports:view"
  | "users:manage"
  | "backup:run";

const ALL: Capability[] = [
  "customers:view",
  "customers:edit",
  "orders:view",
  "orders:edit",
  "orders:delete",
  "workers:view",
  "workers:edit",
  "payroll:edit",
  "fabrics:view",
  "fabrics:edit",
  "purchases:edit",
  "sales:edit",
  "finance:view",
  "finance:edit",
  "reports:view",
  "users:manage",
  "backup:run",
];

export const rolePermissions: Record<Role, Capability[]> = {
  administrator: ALL,
  manager: [
    "customers:view",
    "customers:edit",
    "orders:view",
    "orders:edit",
    "orders:delete",
    "workers:view",
    "workers:edit",
    "payroll:edit",
    "fabrics:view",
    "fabrics:edit",
    "purchases:edit",
    "sales:edit",
    "finance:view",
    "reports:view",
  ],
  accountant: [
    "customers:view",
    "orders:view",
    "workers:view",
    "payroll:edit",
    "fabrics:view",
    "finance:view",
    "finance:edit",
    "reports:view",
  ],
  storekeeper: ["fabrics:view", "fabrics:edit", "purchases:edit", "sales:edit", "reports:view"],
  employee: ["customers:view", "orders:view", "orders:edit", "fabrics:view", "reports:view"],
};

export function can(role: Role, capability: Capability): boolean {
  return rolePermissions[role].includes(capability);
}
