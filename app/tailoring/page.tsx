import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { TailoringFlow } from "@/components/public/tailoring-flow";
import { getCurrentCustomer } from "@/lib/actions/customer-auth";
import { listApprovedBusinesses } from "@/lib/actions/businesses";
import { listPublicDesigns } from "@/lib/actions/designs";
import { listPublicServices } from "@/lib/actions/services";

export const dynamic = "force-dynamic";

export default async function TailoringPage() {
  const [customer, businesses] = await Promise.all([
    getCurrentCustomer().catch(() => null),
    listApprovedBusinesses().catch(() => []),
  ]);

  const tailorBusinesses = (
    await Promise.all(
      businesses.map(async (business) => {
        const [services, designs] = await Promise.all([
          listPublicServices(business.id).catch(() => []),
          listPublicDesigns(business.id, { activeOnly: true }).catch(() => []),
        ]);
        return { ...business, services, designs };
      })
    )
  ).filter((business) => business.services.length > 0);

  return (
    <div className="min-h-screen bg-background px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Khaiati" width={56} height={56} className="h-14 w-14 object-contain" />
          <span className="font-serif text-xl tracking-[0.15em]">KHAIATI</span>
        </Link>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Tailoring flow</p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Choose your garment, tailor, and measurements</h1>
          <p className="max-w-2xl text-muted-foreground">
            Start with the garment you want stitched, confirm that you already have cloth, then pick a tailor and submit your measurements.
          </p>
        </div>

        <TailoringFlow businesses={tailorBusinesses} isSignedIn={Boolean(customer)} />

        <div className="pt-6">
          <h2 className="mb-4 font-serif text-2xl">Available tailors</h2>
          {tailorBusinesses.length === 0 ? (
            <Card>
              <CardContent className="space-y-3 py-16 text-center text-sm text-muted-foreground">
                <p>No approved tailoring businesses have published services yet.</p>
                <p>Check back soon — we're onboarding new tailors regularly.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tailorBusinesses.map((business) => (
                <Link key={business.id} href={`/business/${business.slug}`}>
                  <Card className="h-full transition-colors hover:border-accent">
                    <CardContent className="space-y-3 pt-6">
                      <h3 className="font-serif text-xl">{business.name}</h3>
                      {business.location && (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {business.location}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {business.services.length} active tailoring service{business.services.length === 1 ? "" : "s"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}