"use client";

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
    <section id="services" className="py-24 md:py-32 bg-secondary/20">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Visual */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4 lg:space-y-6">
                <div className="aspect-[3/4] relative overflow-hidden" style={cardShadow}>
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Emballage%20Luxe%203-O7x3bwTICrWOx8qXrukiyPtc260H9T.png"
                    alt="Luxury packaging"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-accent p-6 lg:p-8" style={cardShadow}>
                  <p className="font-serif text-4xl text-accent-foreground mb-2">{t.services.statCategoriesValue}</p>
                  <p className="text-sm text-accent-foreground/80">
                    {t.services.statCategoriesLabel}
                  </p>
                </div>
              </div>
              <div className="space-y-4 lg:space-y-6 pt-12">
                <div className="bg-card p-6 lg:p-8" style={cardShadow}>
                  <p className="font-serif text-4xl mb-2">{t.services.statPaymentsValue}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.services.statPaymentsLabel}
                  </p>
                </div>
                <div className="aspect-[3/4] relative overflow-hidden" style={cardShadow}>
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Livraison%20Luxe%201-j8zso7zcVQvNSvPmorDLIZLHTObiYW.png"
                    alt="Luxury delivery"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 space-y-12">
            <div className="space-y-6">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
                {t.services.eyebrow}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                {t.services.titleLine1}
                <span className="block italic text-accent">{t.services.titleAccentLine}</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t.services.subtitle}
              </p>
            </div>

            <div className="space-y-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="flex gap-6 p-6 bg-card hover:shadow-md transition-shadow duration-300"
                    style={cardShadow}
                  >
                    <div className="flex-shrink-0">
                      <Icon className="w-8 h-8 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-xl">{service.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                      <p className="text-sm text-muted-foreground/70 italic">
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
