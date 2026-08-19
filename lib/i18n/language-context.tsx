"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, LANGUAGE_CYCLE, RTL_LANGUAGES, type Language } from "./translations";

type LanguageContextValue = {
  language: Language;
  dir: "ltr" | "rtl";
  t: typeof translations["en"];
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "khaiati-language";
// Mirrors STORAGE_KEY into a cookie so server components (which can't read
// localStorage or this context) can render in the same language — see
// lib/i18n/get-server-language.ts.
const COOKIE_KEY = "khaiati-language";

function dirFor(language: Language): "ltr" | "rtl" {
  return RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
}

function isLanguage(value: string | null | undefined): value is Language {
  return (LANGUAGE_CYCLE as string[]).includes(value ?? "");
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  // Read server-side from the cookie (app/layout.tsx) so the first client render
  // already matches what the server rendered — avoids a hydration mismatch and
  // a flash of the wrong language.
  initialLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage ?? "en");

  useEffect(() => {
    // localStorage remains the source of truth on repeat visits to the same
    // browser; the cookie exists only so the server can read it too.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored) && stored !== language) setLanguage(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.dir = dirFor(language);
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
    document.cookie = `${COOKIE_KEY}=${language}; path=/; max-age=31536000; SameSite=Lax`;
  }, [language]);

  const toggleLanguage = () =>
    setLanguage((prev) => {
      const nextIndex = (LANGUAGE_CYCLE.indexOf(prev) + 1) % LANGUAGE_CYCLE.length;
      return LANGUAGE_CYCLE[nextIndex];
    });

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir: dirFor(language),
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
