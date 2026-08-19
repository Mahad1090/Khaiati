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
import { ServiceFormDialog } from "@/components/admin/marketplace/service-form-dialog";
import { AvailabilityToggle } from "@/components/admin/marketplace/availability-toggle";
import { listMyServices, setServiceAvailable } from "@/lib/actions/services";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const { t } = await getServerLanguage();
  let services;
  try {
    services = await listMyServices();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">{t.marketplace.servicesTitle}</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">{t.marketplace.servicesTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.marketplace.servicesSubtitle}</p>
        </div>
        <ServiceFormDialog />
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t.marketplace.noServicesYet}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.marketplace.hashCol}</TableHead>
                <TableHead>{t.marketplace.name}</TableHead>
                <TableHead>{t.marketplace.garment}</TableHead>
                <TableHead>{t.marketplace.category}</TableHead>
                <TableHead className="text-right">{t.marketplace.price}</TableHead>
                <TableHead className="text-right">{t.marketplace.estDays}</TableHead>
                <TableHead>{t.marketplace.available}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Badge variant="outline">{s.service_no}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    {s.clothing_category ? garmentTypeLabels[s.clothing_category as GarmentType] : t.marketplace.any}
                  </TableCell>
                  <TableCell>{s.category_name ?? "—"}</TableCell>
                  <TableCell className="text-right">{formatMoney(s.price)}</TableCell>
                  <TableCell className="text-right">{s.estimated_completion_days ?? "—"}</TableCell>
                  <TableCell>
                    <AvailabilityToggle id={s.id} isAvailable={s.is_available} action={setServiceAvailable} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
