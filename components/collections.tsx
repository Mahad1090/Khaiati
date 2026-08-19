"use client";

import { ArrowUpRight } from "lucide-react";

const collections = [
  {
    id: 1,
    name: "Custom Stitching",
    description: "Bring your own fabric, we tailor it",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop",
    itemCount: 24,
  },
  {
    id: 2,
    name: "Fabric Shopping",
    description: "Buy fabric and add stitching in one order",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop",
    itemCount: 18,
  },
  {
    id: 3,
    name: "Alterations",
    description: "Fit adjustments on existing garments",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
    itemCount: 32,
  },
  {
    id: 4,
    name: "Bridal & Formal Wear",
    description: "Occasion pieces, made to measure",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop",
    itemCount: 12,
  },
  {
    id: 5,
    name: "Corporate Uniforms",
    description: "Bulk stitching for teams and businesses",
    image:
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&h=800&fit=crop",
    itemCount: 28,
  },
];

export function Collections() {
  return (
    <section id="collections" className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
              Service Categories
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
              What You Can
              <span className="italic text-accent"> Order</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" })}
            className="group inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase hover:text-accent transition-colors duration-300 self-start md:self-auto"
          >
            Browse Businesses
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>

        {/* Grid - Asymmetric */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className={`group relative overflow-hidden cursor-pointer ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${
                  index === 0
                    ? "aspect-square md:aspect-auto md:h-full"
                    : "aspect-[3/4]"
                }`}
              >
                <img
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-background/70 mb-2">
                    {collection.itemCount} businesses
                  </p>
                  <h3
                    className={`font-serif text-background mb-2 ${
                      index === 0
                        ? "text-3xl md:text-4xl lg:text-5xl"
                        : "text-2xl md:text-3xl"
                    }`}
                  >
                    {collection.name}
                  </h3>
                  <p className="text-background/70 text-sm max-w-xs">
                    {collection.description}
                  </p>

                  {/* Hover arrow */}
                  <div className="absolute top-6 right-6 w-10 h-10 border border-background/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-5 h-5 text-background" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
