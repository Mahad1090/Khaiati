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
  | "workers:edit" // hire/deactivate workers and assign them work
  | "payroll:edit" // salaries, wages, advances — accountant and storekeeper both handle this
  | "fabrics:view"
  | "fabrics:edit"
  | "purchases:edit"
  | "sales:edit"
  | "finance:view"
  | "finance:edit"
  | "reports:view"
  | "catalog:view" // designs/services/products browsing
  | "users:manage" // platform-wide account administration
  | "admins:manage" // add/remove sub-administrators (administrator only)
  | "businesses:manage" // approve/deny/create businesses & store owners (administrator only)
  | "team:manage" // add the store's storekeeper/accountant/workers (manager/owner only)
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
  "catalog:view",
  "users:manage",
  "admins:manage",
  "businesses:manage",
  "team:manage",
  "backup:run",
];

// Role → capability matrix, matching the real hierarchy:
//   Administrator  — runs the whole platform; approves/denies businesses;
//                    can add other administrators.
//   Manager        — the store owner. Adds their own store's Storekeeper,
//                    Accountant, and any number of workers; assigns work;
//                    sees the store's finances.
//   Accountant     — salaries/wages/finance for their store only.
//   Storekeeper    — search + insert (read/write) scoped to their own
//                    store's fabrics/purchases/sales, and can also handle
//                    salaries. No visibility into other stores or businesses.
//   Employee       — a plain worker login with day-to-day order access.
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
    "catalog:view",
    "team:manage",
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
  storekeeper: [
    "fabrics:view",
    "fabrics:edit",
    "purchases:edit",
    "sales:edit",
    "payroll:edit",
    "reports:view",
  ],
  employee: ["customers:view", "orders:view", "orders:edit", "fabrics:view", "catalog:view", "reports:view"],
};

export function can(role: Role, capability: Capability): boolean {
  return rolePermissions[role].includes(capability);
}
