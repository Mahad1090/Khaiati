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
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
            {t.press.eyebrow}
          </p>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight">
            {t.press.titleLine1}
            <span className="italic text-accent"> {t.press.titleAccent}</span>
          </h2>
        </div>

        <div className="space-y-6">
          {/* Pillars */}
          <div className="grid md:grid-cols-3 gap-4">
            {t.press.pillars.map((pillar, index) => (
              <div key={index} className="bg-card p-5 space-y-2 rounded-sm" style={cardShadow}>
                <ShieldCheck className="w-6 h-6 text-accent" />
                <p className="font-serif text-base md:text-lg leading-snug">
                  {pillar.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Commitments */}
          <div className="bg-primary text-primary-foreground p-6 md:p-8 rounded-sm" style={cardShadow}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="md:w-1/3 space-y-2">
                <ShieldCheck className="w-8 h-8 text-accent" />
                <h3 className="font-serif text-xl md:text-2xl">
                  {t.press.commitmentsTitle}
                </h3>
                <p className="text-primary-foreground/70 text-xs leading-relaxed">
                  {t.press.commitmentsSubtitle}
                </p>
              </div>
              <div className="md:w-2/3 space-y-3">
                {t.press.commitments.map((commitment, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2.5 border-b border-primary-foreground/20 last:border-0"
                  >
                    <div>
                      <p className="font-serif text-sm md:text-base mb-0.5">{commitment.name}</p>
                      <p className="text-xs text-primary-foreground/60">
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
