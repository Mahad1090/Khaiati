"use client";

import Image from "next/image";
import { Package, Truck, RotateCcw, Headphones } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const icons = [Truck, Package, RotateCcw, Headphones];
const cardShadow = {
  boxShadow:
    "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
};

export function Services() {
  const { t } = useLanguage();
  const services = t.services.items.map((item, index) => ({ ...item, icon: icons[index] }));

  return (
    <section id="services" className="py-12 md:py-16 bg-secondary/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left - Visual */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="aspect-[4/3] relative overflow-hidden rounded-sm" style={cardShadow}>
                  <Image
                    src="/images/tailoring-tools-fabric.png"
                    alt="Luxury tailoring craftsmanship"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    quality={85}
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="bg-accent p-4 rounded-sm" style={cardShadow}>
                  <p className="font-serif text-2xl text-accent-foreground font-semibold mb-0.5">{t.services.statCategoriesValue}</p>
                  <p className="text-xs text-accent-foreground/80">
                    {t.services.statCategoriesLabel}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <div className="bg-card p-4 rounded-sm" style={cardShadow}>
                  <p className="font-serif text-2xl font-semibold mb-0.5">{t.services.statPaymentsValue}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.services.statPaymentsLabel}
                  </p>
                </div>
                <div className="aspect-[4/3] relative overflow-hidden rounded-sm" style={cardShadow}>
                  <Image
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85"
                    alt="Bespoke tailored fitting"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    quality={85}
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="space-y-1.5">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
                {t.services.eyebrow}
              </p>
              <h2 className="font-serif text-2xl md:text-4xl tracking-tight leading-[1.1]">
                {t.services.titleLine1}
                <span className="block italic text-accent">{t.services.titleAccentLine}</span>
              </h2>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                {t.services.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="flex gap-3.5 p-3.5 bg-card hover:shadow-md transition-shadow duration-300 rounded-sm"
                    style={cardShadow}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-serif text-base">{service.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {service.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 italic">
                        {service.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
