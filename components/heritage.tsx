"use client";

export function Heritage() {
  return (
    <section id="heritage" className="py-24 md:py-32 bg-primary text-primary-foreground overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left - Content */}
          <div className="space-y-8 lg:pr-12">
            <div className="space-y-4">
              <p className="text-sm tracking-[0.3em] uppercase text-primary-foreground/60">
                Our Mission
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                Connecting
                <span className="block italic text-accent">customers and</span>
                tailoring businesses
              </h2>
            </div>

            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-lg">
              Khaiati brings customers, tailors, and fabric shops onto one
              platform — with secure payments and order tracking built in
              from the first stitch to delivery.
            </p>

            <div className="grid grid-cols-3 gap-8 py-8 border-y border-primary-foreground/20">
              <div>
                <p className="font-serif text-4xl md:text-5xl text-accent">5</p>
                <p className="text-sm text-primary-foreground/60 mt-1">
                  Service Categories
                </p>
              </div>
              <div>
                <p className="font-serif text-4xl md:text-5xl text-accent">2</p>
                <p className="text-sm text-primary-foreground/60 mt-1">
                  Order Ways — Own Fabric or Ours
                </p>
              </div>
              <div>
                <p className="font-serif text-4xl md:text-5xl text-accent">EN/FA</p>
                <p className="text-sm text-primary-foreground/60 mt-1">
                  Bilingual, RTL Ready
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-3 border border-primary-foreground text-primary-foreground px-8 py-4 text-sm tracking-[0.2em] uppercase min-h-12 hover:bg-primary-foreground hover:text-primary transition-all duration-300"
            >
              See How It Works
            </button>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="relative aspect-[4/5] lg:aspect-[3/4]">
              {/* Main image */}
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%282%29-qsHmoJIZtkh9Zw7PIDspOZVh50aE2F.png"
                alt="Khaiati tailoring marketplace"
                className="w-full h-full object-cover"
              />

              {/* Decorative quote */}
              <div className="absolute -bottom-8 -left-8 md:-bottom-12 md:-left-12 bg-accent p-6 md:p-8 max-w-[280px]">
                <p className="font-serif text-accent-foreground text-lg md:text-xl italic leading-snug">
                  "Every order, tracked from cut to delivery."
                </p>
                <p className="text-accent-foreground/70 text-sm mt-3">
                  — Khaiati
                </p>
              </div>
            </div>

            {/* Side decoration */}
            <div className="absolute -top-8 -right-4 md:-right-8 w-24 h-24 md:w-32 md:h-32 border border-accent/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
