import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InquiryDialog } from "@/components/public/inquiry-dialog";
import { RequestOrderDialog } from "@/components/public/request-order-dialog";
import { getApprovedBusinessBySlug } from "@/lib/actions/businesses";
import { listPublicDesigns } from "@/lib/actions/designs";
import { listPublicProducts } from "@/lib/actions/products";
import { listPublicServices } from "@/lib/actions/services";
import { getCurrentCustomer } from "@/lib/actions/customer-auth";
import { getPublicReviews, getMyReviewableOrders } from "@/lib/actions/reviews";
import { ReviewDialog } from "@/components/account/review-dialog";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function BusinessStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { t } = await getServerLanguage();

  let business;
  try {
    business = await getApprovedBusinessBySlug(slug);
  } catch {
    business = null;
  }
  if (!business) notFound();

  const [products, services, customer, reviewData, designs] = await Promise.all([
    listPublicProducts(business.id).catch(() => []),
    listPublicServices(business.id).catch(() => []),
    getCurrentCustomer().catch(() => null),
    getPublicReviews(business.id).catch(() => ({ reviews: [], average: 0 })),
    listPublicDesigns(business.id, { activeOnly: true }).catch(() => []),
  ]);
  const isSignedIn = Boolean(customer);
  const { reviews, average } = reviewData;
  const reviewableOrders = isSignedIn
    ? await getMyReviewableOrders(business.id).catch(() => [])
    : [];

  return (
    <div className="min-h-screen bg-background px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Link href="/businesses" className="mb-8 inline-flex items-center gap-3">
          <Image src="/logo.png" alt="Khaiati" width={72} height={72} className="h-16 w-16 object-contain" />
          <span className="font-serif text-2xl tracking-[0.15em]">KHAIATI</span>
        </Link>

        <div className="mb-10 flex flex-col gap-4 border-b border-border pb-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-4xl tracking-tight">{business.name}</h1>
              {reviews.length > 0 && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {average.toFixed(1)} ({reviews.length})
                </span>
              )}
            </div>
            {business.description && (
              <p className="mt-3 max-w-xl text-muted-foreground">{business.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {business.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {business.location}
                </span>
              )}
              {business.contact_phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {business.contact_phone}
                </span>
              )}
              {business.contact_email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {business.contact_email}
                </span>
              )}
            </div>
          </div>
          <InquiryDialog
            title={`${t.businessStorefront.enquireTitle} ${business.name}`}
            trigger={
              <button
                type="button"
                className="h-11 shrink-0 bg-primary px-8 text-sm tracking-[0.15em] uppercase text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t.businessStorefront.getInTouch}
              </button>
            }
          />
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="mb-4 font-serif text-2xl">{t.businessStorefront.services}</h2>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.businessStorefront.noServicesYet}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="space-y-2 pt-6">
                      <h3 className="font-serif text-lg">{s.name}</h3>
                      {s.clothing_category && (
                        <Badge variant="outline">
                          {garmentTypeLabels[s.clothing_category as GarmentType] ?? s.clothing_category}
                        </Badge>
                      )}
                      {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                      <p className="font-serif text-lg text-accent">{formatMoney(s.price)}</p>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/tailoring">Start tailoring flow</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 font-serif text-2xl">{t.businessStorefront.productsFabrics}</h2>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.businessStorefront.noProductsYet}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="space-y-2 pt-6">
                      <h3 className="font-serif text-lg">{p.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {p.category_name && <Badge variant="outline">{p.category_name}</Badge>}
                        {p.color && <Badge variant="secondary">{p.color}</Badge>}
                      </div>
                      {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                      <p className="font-serif text-lg text-accent">{formatMoney(p.price)}</p>
                      <RequestOrderDialog kind="product" id={p.id} name={p.name} isSignedIn={isSignedIn} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">{t.businessStorefront.reviews}</h2>
              {isSignedIn && reviewableOrders.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reviewableOrders.map((o) => (
                    <ReviewDialog
                      key={o.id}
                      orderId={o.id}
                      businessName={business.name}
                      triggerLabel={
                        o.hasReview
                          ? `${t.businessStorefront.editReview} — ${o.order_no}`
                          : `${t.businessStorefront.writeReview} — ${o.order_no}`
                      }
                    />
                  ))}
                </div>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.businessStorefront.noReviewsYet}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="space-y-1 pt-6">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.customer_name}</span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          {r.rating}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                      <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
