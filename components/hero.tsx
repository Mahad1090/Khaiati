"use client";

import { ArrowRight, Search, MapPin, ShieldCheck, QrCode, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = [query, location].filter(Boolean).join(" ").trim();
    router.push(q ? `/businesses?q=${encodeURIComponent(q)}` : "/businesses");
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Full-bleed background video with parallax */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-[120%] object-cover"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-jYfS4M6jRWnwCXxBXYxycBc7Ke4IOr.mp4"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Decorative vertical lines */}
      <div className="absolute inset-0 hidden lg:flex justify-between px-12 pointer-events-none">
        <div className="w-px h-full bg-white/[0.06]" />
        <div className="w-px h-full bg-white/[0.06]" />
        <div className="w-px h-full bg-white/[0.06]" />
        <div className="w-px h-full bg-white/[0.06]" />
        <div className="w-px h-full bg-white/[0.06]" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center pt-24 pb-12 md:pt-28">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            {/* Main headline area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="w-12 h-px bg-[#c9a962]" />
                <p className="text-sm tracking-[0.4em] uppercase text-white/60">{t.hero.tag}</p>
              </div>

              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tight text-white animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {t.hero.titleLine1}
                <br />
                <span className="italic text-[#c9a962]">{t.hero.titleLine2Italic}</span>{" "}
                {t.hero.titleLine2Rest}
              </h1>

              <p className="text-white/60 text-lg md:text-xl max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700">
                {t.hero.subtitle}
              </p>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 bg-white/95 backdrop-blur-sm p-2 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.hero.searchPlaceholder}
                    className="w-full h-11 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <div className="hidden sm:block w-px bg-border" />
                <div className="flex items-center gap-2 px-3 sm:w-40">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.hero.locationPlaceholder}
                    className="w-full h-11 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-6 bg-[#1a1a1a] text-white text-sm tracking-[0.15em] uppercase hover:bg-[#c9a962] hover:text-[#1a1a1a] transition-colors duration-300"
                >
                  {t.hero.searchButton}
                </button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group inline-flex items-center justify-center gap-3 border border-white/30 text-white px-8 py-4 text-sm tracking-[0.2em] uppercase min-h-12 hover:border-white hover:bg-white/10 transition-all duration-500 backdrop-blur-sm"
                >
                  {t.hero.cta1}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Right side - trust indicators (no fabricated scale claims — platform is new) */}
            <div className="lg:col-span-4 hidden lg:flex flex-col items-end gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 max-w-[280px] w-full space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#c9a962] shrink-0" />
                  <p className="text-sm text-white/70">Secure payments &amp; verified businesses</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-[#c9a962] shrink-0" />
                  <p className="text-sm text-white/70">QR-code tracking for every order</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#c9a962] shrink-0" />
                  <p className="text-sm text-white/70">Built for customers and tailoring businesses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a962]/30 to-transparent" />
    </section>
  );
}
