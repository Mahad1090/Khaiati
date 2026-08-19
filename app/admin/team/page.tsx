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
import { listMyTeam } from "@/lib/actions/team";
import { getCurrentAccessContext } from "@/lib/auth/business-context";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const access = await getCurrentAccessContext();
  const isOwner = access.kind === "business_staff" && access.isOwner;

  let team;
  try {
    team = await listMyTeam();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Team</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Team</h1>
          <p className="text-sm text-muted-foreground">
            Who can sign in to this business&apos;s dashboard. Employees don&apos;t see finances or subscription
            info — only the owner does.
          </p>
        </div>
        {isOwner && <InviteEmployeeDialog />}
      </div>

      {team.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No team members yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={m.is_owner ? "default" : "secondary"}>
                      {m.is_owner ? "Owner" : "Employee"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(m.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
