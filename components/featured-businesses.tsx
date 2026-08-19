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
    <section id="businesses" className="py-24 md:py-32">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
              {t.featuredBusinesses.eyebrow}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
              {t.featuredBusinesses.titleLine1}
              <span className="italic text-accent"> {t.featuredBusinesses.titleAccent}</span>
            </h2>
          </div>
          <Link
            href="/businesses"
            className="text-sm tracking-[0.2em] uppercase hover:text-accent transition-colors duration-300"
          >
            {t.featuredBusinesses.browseAll}
          </Link>
        </div>

        {businesses.length === 0 ? (
          <p className="text-muted-foreground">
            {t.featuredBusinesses.noneYet}{" "}
            <Link href="/register-business" className="underline hover:text-accent">
              {t.featuredBusinesses.listYourBusiness}
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <div key={b.id} className="bg-card p-6 space-y-4 border border-border">
                <div className="space-y-1">
                  <Link href={`/business/${b.slug}`}>
                    <h3 className="font-serif text-xl hover:text-accent transition-colors duration-300">
                      {b.name}
                    </h3>
                  </Link>
                  {b.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
                  )}
                </div>
                {b.location && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {b.location}
                  </span>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/business/${b.slug}`}
                    className="flex-1 border border-primary text-primary py-3 text-center text-sm tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  >
                    {t.featuredBusinesses.viewStorefront}
                  </Link>
                  <InquiryDialog
                    title={`${t.featuredBusinesses.interestedIn} ${b.name}`}
                    trigger={
                      <button
                        type="button"
                        className="border border-border px-4 text-sm tracking-[0.15em] uppercase hover:border-accent transition-colors duration-300"
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

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t.featuredBusinesses.ownBusiness}{" "}
          <Link href="/register-business" className="underline hover:text-accent transition-colors duration-300">
            {t.featuredBusinesses.listOnKhaiati}
          </Link>
        </p>
      </div>
    </section>
  );
}
