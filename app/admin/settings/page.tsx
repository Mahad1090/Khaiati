import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackupButton } from "@/components/admin/settings/backup-button";
import { roles, roleLabels, rolePermissions, type Capability } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const envChecks = [
  { key: "DATABASE_URL", label: "PostgreSQL connection" },
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase project URL" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase service role (image uploads)" },
  { key: "NEXT_PUBLIC_CDN_BASE_URL", label: "Cloudflare CDN proxy base URL" },
  { key: "ENABLE_BACKUP_ACTION", label: "Manual backup enabled" },
] as const;

const allCapabilities: Capability[] = [
  "customers:edit",
  "orders:edit",
  "orders:delete",
  "workers:edit",
  "payroll:edit",
  "fabrics:edit",
  "purchases:edit",
  "sales:edit",
  "finance:edit",
  "users:manage",
  "backup:run",
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Environment status, roles, and backups.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment</CardTitle>
          <CardDescription>Checked from server environment variables — values are never shown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {envChecks.map((c) => {
            const configured = Boolean(process.env[c.key]);
            return (
              <div key={c.key} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <div>
                  <p className="text-sm">{c.label}</p>
                  <p className="font-mono text-xs text-muted-foreground">{c.key}</p>
                </div>
                {configured ? (
                  <span className="flex items-center gap-1 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4" /> Not set
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles &amp; Permissions</CardTitle>
          <CardDescription>
            Intended model per the requirements — not yet enforced, since it requires Supabase Auth to be
            configured and wired into each server action. See{" "}
            <code className="rounded bg-muted px-1 py-0.5">lib/permissions.ts</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  {roles.map((r) => (
                    <TableHead key={r} className="text-center">
                      {roleLabels[r]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCapabilities.map((cap) => (
                  <TableRow key={cap}>
                    <TableCell className="font-mono text-xs">{cap}</TableCell>
                    {roles.map((r) => (
                      <TableCell key={r} className="text-center">
                        {rolePermissions[r].includes(cap) ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-accent" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup &amp; Restore</CardTitle>
          <CardDescription>
            Manual backup runs <code className="rounded bg-muted px-1 py-0.5">pg_dump</code> against{" "}
            <code className="rounded bg-muted px-1 py-0.5">DATABASE_URL</code>. Disabled by default —
            requires <code className="rounded bg-muted px-1 py-0.5">ENABLE_BACKUP_ACTION=true</code>, which
            should only be set once this page is behind an administrator-only route.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BackupButton />
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Restore</p>
            <p>
              Restoring overwrites live data, so it isn&apos;t exposed as a one-click web action. To restore, an
              administrator runs:
            </p>
            <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">
              psql "$DATABASE_URL" &lt; khaiati-backup-YYYY-MM-DD.sql
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
