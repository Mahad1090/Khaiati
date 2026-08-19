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
import { ModerateReviewButton } from "@/components/admin/reviews/moderate-review-button";
import { getMyBusinessReviews, listAllReviews } from "@/lib/actions/reviews";
import { getCurrentAccessContext } from "@/lib/auth/business-context";
import { formatDate } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const access = await getCurrentAccessContext();
  const { t } = await getServerLanguage();
  const isPlatformAdmin = access.kind === "platform_admin";

  let reviews;
  try {
    reviews = isPlatformAdmin ? await listAllReviews() : await getMyBusinessReviews();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.reviews.title}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">{t.reviews.title}</h1>
        <p className="text-sm text-muted-foreground">
          {isPlatformAdmin
            ? t.reviews.subtitlePlatform
            : t.reviews.subtitleBusiness}
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t.reviews.noneYet}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.reviews.customer}</TableHead>
                {isPlatformAdmin && <TableHead>{t.reviews.business}</TableHead>}
                <TableHead className="text-right">{t.reviews.rating}</TableHead>
                <TableHead>{t.reviews.comment}</TableHead>
                <TableHead>{t.reviews.date}</TableHead>
                <TableHead>{t.reviews.status}</TableHead>
                {isPlatformAdmin && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.customer_name}</TableCell>
                  {isPlatformAdmin && <TableCell>{(r as { business_name?: string }).business_name}</TableCell>}
                  <TableCell className="text-right">{r.rating} / 5</TableCell>
                  <TableCell className="max-w-xs truncate">{r.comment ?? "—"}</TableCell>
                  <TableCell>{formatDate(r.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "published" ? "default" : "secondary"}>{r.status}</Badge>
                  </TableCell>
                  {isPlatformAdmin && (
                    <TableCell>
                      <ModerateReviewButton id={r.id} status={r.status} />
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
