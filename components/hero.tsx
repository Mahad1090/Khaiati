"use client";

import Link from "next/link";
import { ArrowRight, Search, MapPin, ShieldCheck, QrCode, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";

export function Hero() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const { t } = useLanguage();
  const router = useRouter();
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Write straight to the DOM node on a compositor-friendly property so
      // scrolling never triggers a React re-render of the video subtree.
      el.style.transform = `translate3d(0, ${window.scrollY * 0.3}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
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
        ref={parallaxRef}
        className="absolute inset-0 will-change-transform"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          poster="/videos/hero-poster.jpg"
          className="absolute inset-0 w-full h-[120%] object-cover bg-[#1a1a1a] [transform:translateZ(0)]"
        >
          <source src="/videos/hero.webm" type="video/webm" />
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
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
      <div className="relative z-10 h-full flex flex-col justify-center pt-24 pb-8 md:pt-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            {/* Main headline area */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-[#c9a962]" />
                <p className="text-xs tracking-[0.3em] uppercase text-white/70">{t.hero.tag}</p>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white">
                {t.hero.titleLine1}
                <br />
                <span className="italic text-[#c9a962]">{t.hero.titleLine2Italic}</span>{" "}
                {t.hero.titleLine2Rest}
              </h1>

              <p className="text-white/70 text-sm md:text-base max-w-lg leading-relaxed">
                {t.hero.subtitle}
              </p>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 bg-white/95 backdrop-blur-sm p-1.5 max-w-xl shadow-lg"
              >
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.hero.searchPlaceholder}
                    className="w-full h-9 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <div className="hidden sm:block w-px bg-border" />
                <div className="flex items-center gap-2 px-3 sm:w-36">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.hero.locationPlaceholder}
                    className="w-full h-9 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#1a1a1a] text-white text-xs tracking-[0.15em] uppercase hover:bg-[#c9a962] hover:text-[#1a1a1a] transition-colors duration-300"
                >
                  {t.hero.searchButton}
                </button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/tailoring"
                  className="group inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-2.5 text-xs tracking-[0.2em] uppercase hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Start tailoring
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 text-white px-6 py-2.5 text-xs tracking-[0.2em] uppercase hover:border-white/30 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  {t.hero.cta1}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Right side - trust indicators */}
            <div className="lg:col-span-4 hidden lg:flex flex-col items-end gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 max-w-[260px] w-full space-y-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#c9a962] shrink-0" />
                  <p className="text-xs text-white/80">Secure payments &amp; verified businesses</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <QrCode className="h-4 w-4 text-[#c9a962] shrink-0" />
                  <p className="text-xs text-white/80">QR-code tracking for every order</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-[#c9a962] shrink-0" />
                  <p className="text-xs text-white/80">Built for customers &amp; tailoring shops</p>
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
