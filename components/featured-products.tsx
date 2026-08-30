"use client";

import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { InquiryDialog } from "@/components/public/inquiry-dialog";
import { useLanguage } from "@/lib/i18n/language-context";

const images = [
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=85",
];
const prices = [45, 60, 180, 150];
const isNewFlags = [true, false, true, false];

export function FeaturedProducts() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { t } = useLanguage();

  const products = t.featuredProducts.items.map((item, index) => ({
    id: index + 1,
    ...item,
    price: prices[index],
    image: images[index],
    isNew: isNewFlags[index],
  }));

  return (
    <section id="selection" className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div className="space-y-1">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
                {t.featuredProducts.eyebrow}
              </p>
              <h2 className="font-serif text-2xl md:text-4xl tracking-tight">
                {t.featuredProducts.titleLine1}
                <span className="italic text-accent"> {t.featuredProducts.titleAccent}</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-md md:text-right md:ml-auto">
              {t.featuredProducts.subtitle}
            </p>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative overflow-hidden mb-2 rounded-sm">
                {/* Image */}
                <div className="aspect-[4/5] bg-secondary overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Badges */}
                {product.isNew && (
                  <span className="absolute top-2.5 left-2.5 bg-accent text-accent-foreground px-2 py-0.5 text-[9px] tracking-[0.2em] uppercase">
                    {t.featuredProducts.newBadge}
                  </span>
                )}

                {/* Quick actions */}
                <div
                  className={`absolute inset-x-2.5 bottom-2.5 flex gap-1.5 transition-all duration-300 ${
                    hoveredId === product.id
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <InquiryDialog
                    title={`${t.featuredProducts.enquireTitle} ${product.name}`}
                    trigger={
                      <button
                        type="button"
                        className="flex-1 bg-background/90 backdrop-blur-sm py-2 flex items-center justify-center gap-1.5 text-xs tracking-[0.1em] uppercase hover:bg-background transition-colors duration-200"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {t.featuredProducts.enquire}
                      </button>
                    }
                  />
                  <button
                    type="button"
                    className="w-9 h-9 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors duration-200"
                    aria-label={t.featuredProducts.saveDesign}
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-0.5">
                <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">
                  {product.category}
                </p>
                <h3 className="font-serif text-sm md:text-base group-hover:text-accent transition-colors duration-300 truncate">
                  {product.name}
                </h3>
                <p className="text-xs md:text-sm font-medium">
                  ${product.price.toLocaleString("en-US")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <button
            type="button"
            className="inline-flex items-center justify-center border border-primary text-primary px-6 py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            {t.featuredProducts.viewFullCollection}
          </button>
        </div>
      </div>
    </section>
  );
}
