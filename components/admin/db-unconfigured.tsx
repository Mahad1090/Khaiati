import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Shown wherever a page needs the database but DATABASE_URL isn't reachable yet. */
export function DbUnconfigured({ detail }: { detail?: string }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2 text-accent">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle>Database not connected</CardTitle>
        </div>
        <CardDescription>
          This page reads live data from PostgreSQL. Copy{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-foreground">
            .env.example
          </code>{" "}
          to{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-foreground">
            .env.local
          </code>
          , set <code className="rounded bg-muted px-1 py-0.5 text-foreground">DATABASE_URL</code>,
          and run the migrations in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-foreground">
            db/migrations
          </code>
          .
        </CardDescription>
      </CardHeader>
      {detail && (
        <CardContent>
          <p className="text-xs text-muted-foreground break-all">{detail}</p>
        </CardContent>
      )}
    </Card>
  );
}
