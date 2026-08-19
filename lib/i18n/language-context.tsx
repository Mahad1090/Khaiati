"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Language } from "./translations";

type LanguageContextValue = {
  language: Language;
  dir: "ltr" | "rtl";
  t: typeof translations["en"];
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "khaiati-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fa") setLanguage(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "fa" : "en"));

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir: language === "fa" ? "rtl" : "ltr",
        t: translations[language],
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
