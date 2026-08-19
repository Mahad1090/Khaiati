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
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Left - Sticky Content */}
          <div className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start space-y-8">
            <div className="space-y-4">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
                {t.sustainability.eyebrow}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                {t.sustainability.titleLine1}
                <span className="block italic text-accent">{t.sustainability.titleAccentLine}</span>
              </h2>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed">
              {t.sustainability.subtitle}
            </p>

            <div className="pt-4">
              <div className="inline-block border-border p-6 space-y-2 bg-white border-none border-0" style={cardShadow}>
                <p className="font-serif text-3xl text-accent">5</p>
                <p className="text-sm text-muted-foreground">
                  {t.sustainability.statLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center border border-primary text-primary px-8 py-4 text-sm tracking-[0.2em] uppercase min-h-12 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {t.sustainability.learnMore}
            </button>
          </div>

          {/* Right - Commitments Grid */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6 lg:gap-8">
            {commitments.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-card p-8 lg:p-10 space-y-6 hover:shadow-lg transition-shadow duration-300"
                  style={cardShadow}
                >
                  <Icon className="w-10 h-10 text-accent" />
                  <h3 className="font-serif text-2xl">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
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
