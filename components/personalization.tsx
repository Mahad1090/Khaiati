"use client";

import { Sparkles, MessageSquare, Clock } from "lucide-react";
import { InquiryDialog } from "@/components/public/inquiry-dialog";

export function Personalization() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-20 md:mb-28">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Two Ways to Order
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-6">
            Order it
            <span className="italic text-accent"> Your Way</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Bring your own fabric for stitching, or buy fabric and add
            stitching in the same order — either way, add your measurements
            and we take it from there.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Large Feature Card */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative group overflow-hidden" style={{ boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px" }}>
            <div className="aspect-[16/9] lg:aspect-auto lg:h-full relative">
              <img
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900&h=600&fit=crop"
                alt="Monogram engraving"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-background">
                
                <h3 className="font-serif text-3xl md:text-4xl mb-3">
                  Monogram & Embroidery
                </h3>
                <p className="text-background/80 leading-relaxed mb-6 max-w-xl">
                  Add your initials or a personal detail. Our tailors finish
                  each mark by hand with precision.
                </p>
                <InquiryDialog
                  title="Monogram & Embroidery"
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center text-sm tracking-[0.2em] uppercase hover:text-accent transition-colors duration-300"
                    >
                      Learn More <span className="ml-2">→</span>
                    </button>
                  }
                />
              </div>
            </div>
          </div>

          {/* Service Cards */}
          <div className="bg-card p-8 lg:p-10 space-y-6" style={{ boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px" }}>
            <MessageSquare className="w-10 h-10 text-accent" />
            <h3 className="font-serif text-2xl md:text-3xl">
              Bring Your Own Fabric
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Already have fabric? Choose a business, pick a stitching
              service, add your measurements, and place your order.
            </p>
            <InquiryDialog
              title="Bring Your Own Fabric"
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors duration-300 pt-2"
                >
                  Get Started
                </button>
              }
            />
          </div>

          <div className="bg-accent text-accent-foreground p-8 lg:p-10 space-y-6" style={{ boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px" }}>
            <Clock className="w-10 h-10" />
            <h3 className="font-serif text-2xl md:text-3xl">
              Buy Fabric + Stitching
            </h3>
            <p className="text-accent-foreground/80 leading-relaxed">
              Browse fabric from a business's shop, add it to your order
              along with stitching — all in one checkout.
            </p>
            <InquiryDialog
              title="Buy Fabric + Stitching"
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center text-sm tracking-[0.15em] uppercase hover:opacity-80 transition-opacity duration-300 pt-2"
                >
                  Get Started
                </button>
              }
            />
          </div>

          {/* Image Card */}
          <div className="md:col-span-2 lg:col-span-1 relative group overflow-hidden" style={{ boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px" }}>
            
          </div>
        </div>
      </div>
    </section>
  );
}
