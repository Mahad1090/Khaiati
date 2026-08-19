import { Suspense } from "react";
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
import { SearchBox } from "@/components/admin/search-box";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { BusinessStatusActions } from "@/components/admin/businesses/business-status-actions";
import { listBusinesses, getBusinessCounts } from "@/lib/actions/businesses";
import { businessStatusLabels, type BusinessStatus } from "@/lib/validation/business";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusVariant: Record<BusinessStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  suspended: "outline",
};

async function BusinessesTable({ q, status }: { q: string; status?: BusinessStatus }) {
  let businesses;
  try {
    businesses = await listBusinesses({ search: q, status });
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (businesses.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No businesses found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <Badge variant="outline">{b.business_no}</Badge>
              </TableCell>
              <TableCell className="font-medium">{b.name}</TableCell>
              <TableCell>{b.owner_name ?? "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {b.contact_email}
                <br />
                {b.contact_phone}
              </TableCell>
              <TableCell>{b.location ?? "—"}</TableCell>
              <TableCell>{formatDate(b.created_at)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[b.status]}>{businessStatusLabels[b.status]}</Badge>
              </TableCell>
              <TableCell>
                <BusinessStatusActions id={b.id} status={b.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: BusinessStatus }>;
}) {
  const { q = "", status } = await searchParams;

  let counts;
  try {
    counts = await getBusinessCounts();
  } catch {
    counts = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Businesses</h1>
        <p className="text-sm text-muted-foreground">
          Review, approve, reject, and manage businesses applying to list on Khaiati.
        </p>
      </div>

      {counts && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="font-serif text-2xl">{counts.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="font-serif text-2xl">{counts.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="font-serif text-2xl">{counts.rejected}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Suspended</p>
              <p className="font-serif text-2xl">{counts.suspended}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Suspense>
        <SearchBox placeholder="Search by business or owner name..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <BusinessesTable q={q} status={status} />
      </Suspense>
    </div>
  );
}
