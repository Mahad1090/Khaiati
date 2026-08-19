// Minimal EN/Farsi dictionary — proves the i18n + RTL mechanism (doc section 38-39)
// for the header and hero. Full site-wide translation is a separate, larger pass;
// see the phase plan for the marketplace rebuild.

export type Language = "en" | "fa";

export const translations = {
  en: {
    nav: {
      browse: "Browse Businesses",
      services: "Services",
      fabrics: "Fabrics",
      howItWorks: "How It Works",
      trackOrder: "Track Order",
    },
    hero: {
      tag: "Tailoring Marketplace",
      titleLine1: "Find Tailors.",
      titleLine2Italic: "Order",
      titleLine2Rest: "Stitching.",
      subtitle:
        "Discover tailoring businesses near you, buy fabric, request stitching, and track every order in one place.",
      searchPlaceholder: "What are you looking for? (e.g. shirt stitching)",
      locationPlaceholder: "Location",
      searchButton: "Search",
      cta1: "Browse Businesses",
      cta2: "List Your Business",
    },
    langToggle: "فارسی",
  },
  fa: {
    nav: {
      browse: "مرور کسب‌وکارها",
      services: "خدمات",
      fabrics: "پارچه‌ها",
      howItWorks: "روند کار",
      trackOrder: "پیگیری سفارش",
    },
    hero: {
      tag: "بازار خیاطی",
      titleLine1: "خیاط پیدا کنید.",
      titleLine2Italic: "سفارش",
      titleLine2Rest: "بدوزید.",
      subtitle:
        "کسب‌وکارهای خیاطی نزدیک خود را پیدا کنید، پارچه بخرید، سفارش دوخت ثبت کنید و هر سفارش را پیگیری کنید.",
      searchPlaceholder: "به دنبال چه چیزی هستید؟ (مثلاً دوخت پیراهن)",
      locationPlaceholder: "موقعیت مکانی",
      searchButton: "جستجو",
      cta1: "مرور کسب‌وکارها",
      cta2: "ثبت کسب‌وکار",
    },
    langToggle: "English",
  },
} satisfies Record<Language, Record<string, Record<string, string> | string>>;
