"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Language } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const CHOSEN_KEY = "khaiati-language-chosen";

const LANGUAGE_OPTIONS: { value: Language; label: string; dir: "ltr" | "rtl" }[] = [
  { value: "en", label: "English", dir: "ltr" },
  { value: "fa", label: "فارسی", dir: "rtl" },
  { value: "ps", label: "پښتو", dir: "rtl" },
];

// First-visit language picker. Shown once per browser (tracked via a
// localStorage flag separate from the language preference itself, since the
// preference is always populated with a default the moment the provider
// mounts — see lib/i18n/language-context.tsx).
export function LanguageSelectModal() {
  const { t, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const chosen = window.localStorage.getItem(CHOSEN_KEY);
    if (!chosen) setOpen(true);
  }, []);

  function choose(language: Language) {
    setLanguage(language);
    window.localStorage.setItem(CHOSEN_KEY, "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 space-y-1 text-center">
          <p className="font-serif text-xl text-foreground">{t.languageSelect.heading}</p>
          <p className="text-sm text-muted-foreground">{t.languageSelect.subheading}</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              dir={option.dir}
              onClick={() => choose(option.value)}
              className={cn(
                "w-full rounded-md border border-border px-4 py-3 text-base font-medium transition-colors",
                "hover:border-accent hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
