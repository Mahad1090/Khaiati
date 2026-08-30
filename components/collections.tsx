"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const images = [
  "/images/tailoring-shears-machine.jpg",
  "/images/fabric-shopping-rolls.jpg",
  "/images/tailoring-tools-fabric.png",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
  "/images/tailoring-machine-tape.png",
];

const itemCounts = [24, 18, 32, 12, 28];

export function Collections() {
  const { t } = useLanguage();
  const collections = t.collections.items.map((item, index) => ({
    id: index + 1,
    ...item,
    image: images[index],
    itemCount: itemCounts[index],
  }));

  return (
    <section id="collections" className="py-12 md:py-16 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              {t.collections.eyebrow}
            </p>
            <h2 className="font-serif text-2xl md:text-4xl tracking-tight">
              {t.collections.titleLine1}
              <span className="italic text-accent"> {t.collections.titleAccent}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" })}
            className="group inline-flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase hover:text-accent transition-colors duration-300 self-start sm:self-auto"
          >
            {t.collections.browseBusinesses}
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>

        {/* Grid - Asymmetric Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className={`group relative overflow-hidden cursor-pointer rounded-sm ${
                index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${
                  index === 0
                    ? "aspect-[4/3] sm:aspect-auto sm:h-full min-h-[220px]"
                    : "aspect-[16/10] sm:aspect-[4/3]"
                }`}
              >
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  sizes={index === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
                  quality={85}
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-background/75 mb-1">
                    {collection.itemCount} {t.collections.businessesSuffix}
                  </p>
                  <h3
                    className={`font-serif text-background mb-1 ${
                      index === 0
                        ? "text-xl md:text-2xl lg:text-3xl"
                        : "text-base md:text-lg"
                    }`}
                  >
                    {collection.name}
                  </h3>
                  <p className="text-background/75 text-xs line-clamp-1 max-w-xs">
                    {collection.description}
                  </p>

                  {/* Hover arrow */}
                  <div className="absolute top-3 right-3 w-7 h-7 border border-background/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5 text-background" />
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
