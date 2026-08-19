import "server-only";
import { cookies } from "next/headers";
import { translations, LANGUAGE_CYCLE, RTL_LANGUAGES, type Language } from "./translations";

const COOKIE_KEY = "khaiati-language";

/**
 * Server Component counterpart to useLanguage() — reads the language cookie
 * that LanguageProvider (lib/i18n/language-context.tsx) mirrors on every
 * change, since Server Components can't use React context or localStorage.
 * Defaults to "en" for first-time visitors (no cookie set yet).
 */
export async function getServerLanguage(): Promise<{
  language: Language;
  dir: "ltr" | "rtl";
  t: typeof translations["en"];
}> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_KEY)?.value;
  const language: Language = (LANGUAGE_CYCLE as string[]).includes(raw ?? "")
    ? (raw as Language)
    : "en";

  return {
    language,
    dir: RTL_LANGUAGES.includes(language) ? "rtl" : "ltr",
    t: translations[language],
  };
}
