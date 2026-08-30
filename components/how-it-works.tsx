"use client";

import { Search, Ruler, CreditCard, QrCode } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const icons = [Search, Ruler, CreditCard, QrCode];

export function HowItWorks() {
  const { t } = useLanguage();
  const steps = t.howItWorks.steps.map((step, index) => ({ ...step, icon: icons[index] }));

  return (
    <section id="how-it-works" className="py-12 md:py-16 bg-secondary/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
            {t.howItWorks.eyebrow}
          </p>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight">
            {t.howItWorks.titleLine1}
            <span className="italic text-accent"> {t.howItWorks.titleAccent}</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-card/50 p-4 border border-border/50 rounded-sm space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-serif text-xl text-accent font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <step.icon className="h-4 w-4 text-accent" />
              </div>
              <h3 className="font-serif text-base">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
