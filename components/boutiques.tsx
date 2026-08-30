"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { InquiryDialog } from "@/components/public/inquiry-dialog";

// TODO: replace with the real atelier address, phone, and hours.
const boutiques = [
  {
    id: 1,
    city: "The Atelier",
    address: "Address coming soon",
    phone: "Contact us to schedule a visit",
    hours: "By appointment",
    image:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=85",
    flagship: true,
  },
];

export function Boutiques() {
  return (
    <section id="boutiques" className="py-24 md:py-32">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            The Atelier
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6">
            Visit
            <span className="italic text-accent"> Us</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Book a fitting and get personalized guidance from our tailors on
            fabric, fit, and finish.
          </p>
        </div>

        {/* Boutiques grid */}
        <div className="grid gap-6 md:gap-8 max-w-md mx-auto">
          {boutiques.map((boutique) => (
            <div
              key={boutique.id}
              className={`group relative ${
                boutique.flagship ? "md:col-span-1" : ""
              }`}
            >
              {/* Image */}
              <div className="relative overflow-hidden mb-6">
                <div className="aspect-[3/2]">
                  <img
                    src={boutique.image || "/placeholder.svg"}
                    alt={`Boutique ${boutique.city}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {boutique.flagship && (
                  <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-4 py-2">
                    <p className="text-[10px] tracking-[0.2em] uppercase">
                      Flagship
                    </p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="font-serif text-2xl md:text-3xl">
                  {boutique.city}
                </h3>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{boutique.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{boutique.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{boutique.hours}</span>
                  </div>
                </div>

                <InquiryDialog
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors duration-300 pt-2"
                    >
                      Book Appointment
                      <span className="ml-2">→</span>
                    </button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
