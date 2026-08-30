import Link from "next/link";
import { MapPin } from "lucide-react";
import { InquiryDialog } from "@/components/public/inquiry-dialog";
import { listApprovedBusinesses } from "@/lib/actions/businesses";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export async function FeaturedBusinesses() {
  const { t } = await getServerLanguage();
  let businesses: Awaited<ReturnType<typeof listApprovedBusinesses>> = [];
  try {
    businesses = (await listApprovedBusinesses()).slice(0, 6);
  } catch {
    businesses = [];
  }

  return (
    <section id="businesses" className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              {t.featuredBusinesses.eyebrow}
            </p>
            <h2 className="font-serif text-2xl md:text-4xl tracking-tight">
              {t.featuredBusinesses.titleLine1}
              <span className="italic text-accent"> {t.featuredBusinesses.titleAccent}</span>
            </h2>
          </div>
          <Link
            href="/businesses"
            className="text-xs tracking-[0.2em] uppercase hover:text-accent transition-colors duration-300 self-start sm:self-auto"
          >
            {t.featuredBusinesses.browseAll}
          </Link>
        </div>

        {businesses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t.featuredBusinesses.noneYet}{" "}
            <Link href="/register-business" className="underline hover:text-accent">
              {t.featuredBusinesses.listYourBusiness}
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <div key={b.id} className="bg-card p-4 space-y-3 border border-border">
                <div className="space-y-1">
                  <Link href={`/business/${b.slug}`}>
                    <h3 className="font-serif text-lg hover:text-accent transition-colors duration-300">
                      {b.name}
                    </h3>
                  </Link>
                  {b.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{b.description}</p>
                  )}
                </div>
                {b.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {b.location}
                  </span>
                )}
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/business/${b.slug}`}
                    className="flex-1 border border-primary text-primary py-2 text-center text-xs tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  >
                    {t.featuredBusinesses.viewStorefront}
                  </Link>
                  <InquiryDialog
                    title={`${t.featuredBusinesses.interestedIn} ${b.name}`}
                    trigger={
                      <button
                        type="button"
                        className="border border-border px-3 text-xs tracking-[0.15em] uppercase hover:border-accent transition-colors duration-300"
                        aria-label={`${t.featuredBusinesses.enquireAbout} ${b.name}`}
                      >
                        {t.featuredBusinesses.enquire}
                      </button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t.featuredBusinesses.ownBusiness}{" "}
          <Link href="/register-business" className="underline hover:text-accent transition-colors duration-300">
            {t.featuredBusinesses.listOnKhaiati}
          </Link>
        </p>
      </div>
    </section>
  );
}
