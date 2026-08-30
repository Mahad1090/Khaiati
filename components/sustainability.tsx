"use client";

import { Leaf, Heart, Shield, Recycle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const icons = [Leaf, Heart, Shield, Recycle];
const cardShadow = {
  boxShadow:
    "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
};

export function Sustainability() {
  const { t } = useLanguage();
  const commitments = t.sustainability.commitments.map((item, index) => ({ ...item, icon: icons[index] }));

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left - Sticky Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
                {t.sustainability.eyebrow}
              </p>
              <h2 className="font-serif text-2xl md:text-4xl tracking-tight leading-[1.1]">
                {t.sustainability.titleLine1}
                <span className="block italic text-accent">{t.sustainability.titleAccentLine}</span>
              </h2>
            </div>

            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
              {t.sustainability.subtitle}
            </p>

            <div>
              <div className="inline-block p-4 space-y-1 bg-card rounded-sm" style={cardShadow}>
                <p className="font-serif text-2xl text-accent font-semibold">5</p>
                <p className="text-xs text-muted-foreground">
                  {t.sustainability.statLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center border border-primary text-primary px-6 py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {t.sustainability.learnMore}
            </button>
          </div>

          {/* Right - Commitments Grid */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3.5">
            {commitments.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-card p-4 space-y-2 hover:shadow-md transition-shadow duration-300 rounded-sm"
                  style={cardShadow}
                >
                  <Icon className="w-6 h-6 text-accent" />
                  <h3 className="font-serif text-base">{item.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
