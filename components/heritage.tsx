"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-context";

export function Heritage() {
  const { t } = useLanguage();

  return (
    <section id="heritage" className="py-12 md:py-16 bg-primary text-primary-foreground overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-5 lg:pr-6">
            <div className="space-y-2">
              <p className="text-xs tracking-[0.3em] uppercase text-primary-foreground/60">
                {t.heritage.eyebrow}
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight leading-[1.1]">
                {t.heritage.titleLine1}
                <span className="block italic text-accent">{t.heritage.titleAccentLine}</span>
                {t.heritage.titleRest}
              </h2>
            </div>

            <p className="text-primary-foreground/70 text-xs md:text-sm leading-relaxed max-w-md">
              {t.heritage.subtitle}
            </p>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-primary-foreground/20">
              <div>
                <p className="font-serif text-2xl md:text-3xl text-accent">5</p>
                <p className="text-xs text-primary-foreground/60 mt-0.5">
                  {t.heritage.stat1Label}
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl md:text-3xl text-accent">2</p>
                <p className="text-xs text-primary-foreground/60 mt-0.5">
                  {t.heritage.stat2Label}
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl md:text-3xl text-accent">{t.heritage.stat3Value}</p>
                <p className="text-xs text-primary-foreground/60 mt-0.5">
                  {t.heritage.stat3Label}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground text-primary-foreground px-6 py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-primary-foreground hover:text-primary transition-all duration-300"
            >
              {t.heritage.cta}
            </button>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="relative aspect-[4/3] max-h-[340px] overflow-hidden rounded-sm">
              <Image
                src="/images/our-mission-atelier.png"
                alt="Master tailor atelier and bespoke craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
                loading="lazy"
                className="object-cover"
              />

              {/* Decorative quote */}
              <div className="absolute bottom-3 left-3 bg-accent p-3.5 max-w-[220px] shadow-lg">
                <p className="font-serif text-accent-foreground text-xs italic leading-snug">
                  "{t.heritage.quote}"
                </p>
                <p className="text-accent-foreground/70 text-[10px] mt-1.5">
                  {t.heritage.quoteAuthor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
