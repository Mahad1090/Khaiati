"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const images = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=85",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=85",
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();
  const testimonials = t.testimonials.items.map((item, index) => ({
    id: index + 1,
    ...item,
    image: images[index],
  }));

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr,1.8fr] gap-8 items-center">
          {/* Left - Title */}
          <div className="space-y-3">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              {t.testimonials.eyebrow}
            </p>
            <h2 className="font-serif text-2xl md:text-4xl tracking-tight">
              {t.testimonials.titleLine1}
              <span className="block italic text-accent">{t.testimonials.titleAccentLine}</span>
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
              {t.testimonials.subtitle}
            </p>

            {/* Navigation */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={prev}
                className="w-9 h-9 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-300 rounded-sm"
                aria-label={t.testimonials.prevAria}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="w-9 h-9 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-300 rounded-sm"
                aria-label={t.testimonials.nextAria}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right - Testimonial */}
          <div className="relative">
            {/* Quote icon */}
            <Quote className="absolute -top-3 -left-3 w-10 h-10 text-accent/20" />

            <div className="bg-card p-6 md:p-8 relative rounded-sm shadow-sm">
              <div className="space-y-4">
                <p className="font-serif text-lg md:text-2xl leading-snug text-balance">
                  "{current.quote}"
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <Image
                    src={current.image || "/placeholder.svg"}
                    alt={current.author}
                    width={40}
                    height={40}
                    quality={85}
                    loading="lazy"
                    className="w-10 h-10 object-cover rounded-full"
                  />
                  <div>
                    <p className="font-medium text-sm">{current.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {current.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Indicator */}
              <div className="absolute bottom-5 right-6 flex gap-1.5">
                {testimonials.map((_, index) => (
                  <button
                    key={`indicator-${index}-${testimonials[index].id}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? "bg-accent w-6"
                        : "bg-border w-1.5 hover:bg-muted-foreground"
                    }`}
                    aria-label={`${t.testimonials.goToPrefix} ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
