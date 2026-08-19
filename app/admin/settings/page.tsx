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
import { getServerLanguage } from "@/lib/i18n/get-server-language";

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

export default async function SettingsPage() {
  const { t } = await getServerLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">{t.settingsPage.title}</h1>
        <p className="text-sm text-muted-foreground">{t.settingsPage.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.settingsPage.environment}</CardTitle>
          <CardDescription>{t.settingsPage.environmentDesc}</CardDescription>
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
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {t.settingsPage.configured}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4" /> {t.settingsPage.notSet}
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.settingsPage.rolesPermissions}</CardTitle>
          <CardDescription>
            {t.settingsPage.rolesPermissionsDesc}{" "}
            <code className="rounded bg-muted px-1 py-0.5">lib/permissions.ts</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.settingsPage.capability}</TableHead>
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
          <CardTitle className="text-base">{t.settingsPage.backupRestore}</CardTitle>
          <CardDescription>
            {t.settingsPage.backupDescPre} <code className="rounded bg-muted px-1 py-0.5">pg_dump</code> {t.settingsPage.backupDescMid1}{" "}
            <code className="rounded bg-muted px-1 py-0.5">DATABASE_URL</code>{t.settingsPage.backupDescMid2}{" "}
            <code className="rounded bg-muted px-1 py-0.5">ENABLE_BACKUP_ACTION=true</code>{t.settingsPage.backupDescEnd}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BackupButton />
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">{t.settingsPage.restore}</p>
            <p>
              {t.settingsPage.restoreDesc}
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
