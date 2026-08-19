"use client";

import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const cardShadow = {
  boxShadow:
    "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
};

export function Press() {
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-20 md:mb-28">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {t.press.eyebrow}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
            {t.press.titleLine1}
            <span className="italic text-accent"> {t.press.titleAccent}</span>
          </h2>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {/* Pillars */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {t.press.pillars.map((pillar, index) => (
              <div key={index} className="bg-card p-8 lg:p-10 space-y-6" style={cardShadow}>
                <ShieldCheck className="w-8 h-8 text-accent" />
                <p className="font-serif text-xl md:text-2xl leading-snug">
                  {pillar.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Commitments */}
          <div className="bg-primary text-primary-foreground p-12 lg:p-16" style={cardShadow}>
            <div className="flex flex-col md:flex-row md:items-center gap-12">
              <div className="md:w-1/3">
                <ShieldCheck className="w-12 h-12 text-accent mb-6" />
                <h3 className="font-serif text-3xl md:text-4xl mb-4">
                  {t.press.commitmentsTitle}
                </h3>
                <p className="text-primary-foreground/70 leading-relaxed">
                  {t.press.commitmentsSubtitle}
                </p>
              </div>
              <div className="md:w-2/3 space-y-6">
                {t.press.commitments.map((commitment, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-6 border-b border-primary-foreground/20 last:border-0"
                  >
                    <div>
                      <p className="font-serif text-xl mb-1">{commitment.name}</p>
                      <p className="text-sm text-primary-foreground/60">
                        {commitment.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
