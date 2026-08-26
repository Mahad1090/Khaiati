import { Card, CardContent } from "@/components/ui/card";
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
import { InviteEmployeeDialog } from "@/components/admin/team/invite-employee-dialog";
import { RemoveTeamMemberButton } from "@/components/admin/team/remove-team-member-button";
import { listMyTeam } from "@/lib/actions/team";
import { getCurrentAccessContext } from "@/lib/auth/business-context";
import { roleLabels } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const access = await getCurrentAccessContext();
  const { t } = await getServerLanguage();
  const isOwner = access.kind === "business_staff" && access.isOwner;

  let team;
  try {
    team = await listMyTeam();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.platformAdmin.teamTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.platformAdmin.teamTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {t.platformAdmin.teamSubtitle}
          </p>
        </div>
        {isOwner && <InviteEmployeeDialog />}
      </div>

      {team.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t.platformAdmin.noTeamMembersYet}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.platformAdmin.name}</TableHead>
                <TableHead>{t.platformAdmin.email}</TableHead>
                <TableHead>{t.platformAdmin.role}</TableHead>
                <TableHead>{t.platformAdmin.joined}</TableHead>
                {isOwner && <TableHead className="text-right" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.full_name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={m.is_owner ? "default" : "secondary"}>
                      {m.is_owner ? t.platformAdmin.owner2 : roleLabels[m.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(m.created_at)}</TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {!m.is_owner && <RemoveTeamMemberButton userId={m.id} />}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
