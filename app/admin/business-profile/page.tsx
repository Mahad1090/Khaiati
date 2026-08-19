import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { BusinessProfileForm } from "@/components/admin/businesses/business-profile-form";
import { getMyBusinessProfile } from "@/lib/actions/businesses";
import { businessStatusLabels, type BusinessStatus } from "@/lib/validation/business";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function BusinessProfilePage() {
  const { t } = await getServerLanguage();
  let business;
  try {
    business = await getMyBusinessProfile();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.platformAdmin.businessProfileTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.platformAdmin.businessProfileTitle}</h1>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t.platformAdmin.noBusinessFound}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-2xl">{t.platformAdmin.businessProfileTitle}</h1>
        <Badge variant="outline">{business.business_no}</Badge>
        <Badge>{businessStatusLabels[business.status as BusinessStatus]}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.platformAdmin.storefrontDetails}</CardTitle>
          <CardDescription>
            {t.platformAdmin.storefrontDetailsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessProfileForm
            defaultValues={{
              name: business.name,
              contactEmail: business.contact_email ?? "",
              contactPhone: business.contact_phone ?? "",
              location: business.location ?? "",
              description: business.description ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
