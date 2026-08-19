import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBox } from "@/components/admin/search-box";
import { DesignFormDialog } from "@/components/admin/designs/design-form-dialog";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { ActiveToggle } from "./active-toggle";
import { listDesigns } from "@/lib/actions/designs";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { cdnImageUrl } from "@/lib/cdn";

export const dynamic = "force-dynamic";

async function DesignsGrid({ q }: { q: string }) {
  let designs;
  try {
    designs = await listDesigns({ search: q });
  } catch (err) {
    return <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />;
  }

  if (designs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No designs found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {designs.map((d) => {
        const imageUrl = cdnImageUrl(d.image_path);
        return (
          <Card key={d.id} className="overflow-hidden">
            <div className="flex h-40 items-center justify-center bg-muted">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={d.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">No image</span>
              )}
            </div>
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{d.name}</p>
                <ActiveToggle id={d.id} isActive={d.is_active} />
              </div>
              <Badge variant="outline">
                {garmentTypeLabels[d.garment_type as GarmentType] ?? d.garment_type}
              </Badge>
              {d.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default async function DesignsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl">Designs</h1>
          <p className="text-sm text-muted-foreground">
            Reusable garment designs selectable during order creation.
          </p>
        </div>
        <DesignFormDialog />
      </div>

      <Suspense>
        <SearchBox placeholder="Search designs..." />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <DesignsGrid q={q} />
      </Suspense>
    </div>
  );
}
