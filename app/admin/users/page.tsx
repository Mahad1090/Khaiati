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
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { listUserProfiles } from "@/lib/actions/users";
import { roleLabels } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { t } = await getServerLanguage();
  let users;
  try {
    users = await listUserProfiles();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.platformAdmin.usersTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">{t.platformAdmin.usersTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {t.platformAdmin.usersSubtitle}
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">{t.platformAdmin.signInNotConfigured}</CardTitle>
          <CardDescription>
            {t.platformAdmin.signInNotConfiguredDescPre}{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> {t.platformAdmin.signInNotConfiguredDescMid1}{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> {t.platformAdmin.signInNotConfiguredDescMid2}{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">user_profiles</code>{" "}
            {t.platformAdmin.signInNotConfiguredDescMid3}{" "}
            <a href="/admin/settings" className="underline hover:text-accent">
              {t.platformAdmin.settings}
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t.platformAdmin.noUsersYet}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.platformAdmin.name}</TableHead>
                <TableHead>{t.platformAdmin.role}</TableHead>
                <TableHead>{t.platformAdmin.status}</TableHead>
                <TableHead>{t.platformAdmin.joined}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabels[u.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.is_active ? "default" : "secondary"}>
                      {u.is_active ? t.platformAdmin.active : t.platformAdmin.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(u.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
