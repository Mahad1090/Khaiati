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

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let users;
  try {
    users = await listUserProfiles();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Users</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Users</h1>
        <p className="text-sm text-muted-foreground">
          Accounts and roles — Administrator, Manager, Accountant, Storekeeper, Employee.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Sign-in not yet configured</CardTitle>
          <CardDescription>
            Accounts are created through Supabase Auth. Once{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> are
            set, new sign-ups populate <code className="rounded bg-muted px-1 py-0.5 text-foreground">user_profiles</code>{" "}
            below and can be assigned a role. See the permission matrix in{" "}
            <a href="/admin/settings" className="underline hover:text-accent">
              Settings
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No user accounts yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
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
                      {u.is_active ? "Active" : "Inactive"}
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
