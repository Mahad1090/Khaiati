"use client";

import { Search, Ruler, CreditCard, QrCode } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover",
    description: "Browse tailoring businesses and fabric shops near you.",
  },
  {
    icon: Ruler,
    title: "Order",
    description:
      "Bring your own fabric, or buy fabric and request stitching — either way, add your measurements.",
  },
  {
    icon: CreditCard,
    title: "Checkout",
    description: "Review your order and pay securely.",
  },
  {
    icon: QrCode,
    title: "Track",
    description:
      "Every order gets a secure QR code — scan it any time to see cutting, stitching, finishing, and delivery status.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-secondary/20">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16 md:mb-24">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            How It Works
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
            From Order
            <span className="italic text-accent"> to Doorstep</span>
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-serif text-3xl text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <step.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-xl">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
