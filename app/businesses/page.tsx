import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listApprovedBusinesses } from "@/lib/actions/businesses";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { t } = await getServerLanguage();
  let businesses: Awaited<ReturnType<typeof listApprovedBusinesses>> = [];
  try {
    businesses = await listApprovedBusinesses(q);
  } catch {
    businesses = [];
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <Image src="/logo.png" alt="Khaiati" width={56} height={56} className="h-14 w-14 object-contain" />
          <span className="font-serif text-xl tracking-[0.15em]">KHAIATI</span>
        </Link>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t.businesses.discoverEyebrow}</p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight">{t.businesses.title}</h1>
          <Button asChild className="mt-6">
            <Link href="/tailoring">Start tailoring flow</Link>
          </Button>
        </div>

        <form className="mb-10 max-w-md" method="get">
          <Input name="q" defaultValue={q} placeholder={t.businesses.searchPlaceholder} />
        </form>

        {businesses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              {q ? t.businesses.noneMatch : t.businesses.noneYet}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <Link key={b.id} href={`/business/${b.slug}`}>
                <Card className="h-full transition-colors hover:border-accent">
                  <CardContent className="space-y-3 pt-6">
                    <h2 className="font-serif text-xl">{b.name}</h2>
                    {b.location && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {b.location}
                      </p>
                    )}
                    {b.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
