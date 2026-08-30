"use client";

import { MessageSquare, Clock } from "lucide-react";
import { InquiryDialog } from "@/components/public/inquiry-dialog";
import { useLanguage } from "@/lib/i18n/language-context";

const cardShadow = {
  boxShadow:
    "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
};

export function Personalization() {
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
            {t.personalization.eyebrow}
          </p>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight leading-[1.1] mb-2">
            {t.personalization.titleLine1}
            <span className="italic text-accent"> {t.personalization.titleAccent}</span>
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
            {t.personalization.subtitle}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large Feature Card */}
          <div className="md:col-span-2 lg:col-span-2 relative group overflow-hidden rounded-sm min-h-[280px]" style={cardShadow}>
            <div className="relative h-full min-h-[280px]">
              <img
                src="/images/tailoring-machine-tape.png"
                alt="Bespoke tailoring and personalized craftsmanship"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/35 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-background">
                <h3 className="font-serif text-xl md:text-2xl mb-1.5">
                  {t.personalization.monogramTitle}
                </h3>
                <p className="text-background/80 text-xs md:text-sm leading-relaxed mb-3 max-w-lg">
                  {t.personalization.monogramDesc}
                </p>
                <InquiryDialog
                  title={t.personalization.monogramTitle}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center text-xs tracking-[0.2em] uppercase hover:text-accent transition-colors duration-300"
                    >
                      {t.personalization.learnMore} <span className="ml-1.5">→</span>
                    </button>
                  }
                />
              </div>
            </div>
          </div>

          {/* Service Cards (stacked side-by-side or in column) */}
          <div className="flex flex-col gap-4">
            <div className="bg-card p-5 space-y-2.5 rounded-sm flex-1" style={cardShadow}>
              <MessageSquare className="w-6 h-6 text-accent" />
              <h3 className="font-serif text-lg">
                {t.personalization.bringOwnTitle}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t.personalization.bringOwnDesc}
              </p>
              <InquiryDialog
                title={t.personalization.bringOwnTitle}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center text-xs tracking-[0.15em] uppercase hover:text-accent transition-colors duration-300 pt-1"
                  >
                    {t.personalization.getStarted}
                  </button>
                }
              />
            </div>

            <div className="bg-accent text-accent-foreground p-5 space-y-2.5 rounded-sm flex-1" style={cardShadow}>
              <Clock className="w-6 h-6" />
              <h3 className="font-serif text-lg">
                {t.personalization.buyFabricTitle}
              </h3>
              <p className="text-accent-foreground/80 text-xs leading-relaxed">
                {t.personalization.buyFabricDesc}
              </p>
              <InquiryDialog
                title={t.personalization.buyFabricTitle}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center text-xs tracking-[0.15em] uppercase hover:opacity-80 transition-opacity duration-300 pt-1"
                  >
                    {t.personalization.getStarted}
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
