"use client";

import React from "react"

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/actions/public-site";
import { useLanguage } from "@/lib/i18n/language-context";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await subscribeNewsletter({ email });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.newsletter.subscribed);
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 md:py-32 bg-secondary/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="space-y-6 mb-10">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
              {t.newsletter.eyebrow}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
              {t.newsletter.titleLine1}
              <span className="italic text-accent"> {t.newsletter.titleAccent}</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t.newsletter.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                {t.newsletter.emailLabel}
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletter.emailPlaceholder}
                required
                className="w-full h-14 px-6 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors duration-300 text-base"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 h-14 text-sm tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 min-w-[180px] disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t.newsletter.subscribe}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-6">
            {t.newsletter.privacyPrefix}{" "}
            <button type="button" className="underline hover:text-accent transition-colors duration-300">
              {t.newsletter.privacyLink}
            </button>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
