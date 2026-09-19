"use client";

/**
 * lib/i18n/LanguageContext.tsx
 *
 * Lightweight client-side i18n system (no URL/route change).
 * - Persists the chosen language in localStorage under "dayni-lang".
 * - Falls back to the browser language on first visit (ar/en only).
 * - Flips <html dir> and <html lang> automatically.
 * - Exposes t("namespace.key") for translation lookups, with graceful
 *   fallback to the key itself if a translation is missing (so nothing
 *   ever renders blank while pages are migrated one by one).
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import ar from "./translations/ar.json";
import en from "./translations/en.json";

export type Locale = "ar" | "en";
export type Direction = "rtl" | "ltr";

const STORAGE_KEY = "dayni-lang";

const dictionaries: Record<Locale, Record<string, unknown>> = { ar, en };

function getNested(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object" && part in (acc as Record<string, unknown>)
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      obj
    );
}

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "ar";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "en") return stored;
  } catch {
    // localStorage unavailable (private mode, etc.) — ignore and fall through
  }
  const browserLang = window.navigator?.language?.toLowerCase() || "";
  return browserLang.startsWith("ar") ? "ar" : browserLang ? "en" : "ar";
}

interface LanguageContextValue {
  locale: Locale;
  dir: Direction;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Translate a dot-path key, e.g. t("nav.home"). Falls back to the key. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Like t(), but returns the raw value (array/object/string) for structured
   *  content such as the legal pages' `sections` arrays. Falls back to []. */
  tRaw: (key: string) => unknown;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to "ar" for the very first server-rendered paint (matches the
  // app's original behavior), then sync to the stored/browser preference
  // right after mount to avoid a hydration mismatch flash.
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocaleState(detectInitialLocale());
    setHydrated(true);
  }, []);

  const dir: Direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore write failures
    }
  }, [locale, dir, hydrated]);

  const setLocale = (next: Locale) => setLocaleState(next);
  const toggleLocale = () => setLocaleState((prev) => (prev === "ar" ? "en" : "ar"));

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[locale];
      const fallbackDict = dictionaries.ar;
      let value = getNested(dict, key);
      if (typeof value !== "string") value = getNested(fallbackDict, key);
      let result = typeof value === "string" ? value : key;
      if (vars) {
        for (const [varKey, varVal] of Object.entries(vars)) {
          result = result.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(varVal));
        }
      }
      return result;
    };
  }, [locale]);

  const tRaw = useMemo(() => {
    return (key: string) => {
      const value = getNested(dictionaries[locale], key);
      if (value !== undefined) return value;
      return getNested(dictionaries.ar, key) ?? [];
    };
  }, [locale]);

  const value: LanguageContextValue = { locale, dir, setLocale, toggleLocale, t, tRaw };

  return (
    <LanguageContext.Provider value={value}>
      {/* Belt-and-suspenders: in addition to mutating <html dir>/<html lang>
          above, wrap the whole app in an element carrying the same dir/lang.
          This guarantees correct layout mirroring immediately on every
          render (no dependency on the imperative DOM mutation's timing),
          and protects pages that forget to set dir explicitly themselves. */}
      <div dir={dir} lang={locale} className="contents">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

/** Primary hook used across the app: const { t, locale, dir, toggleLocale } = useTranslation(); */
export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within <LanguageProvider>");
  }
  return ctx;
}

/** Helper for locale-aware number/currency formatting outside components too. */
export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(locale === "ar" ? "ar-SA" : "en-US");
}

export function formatDate(date: string | number | Date, locale: Locale): string {
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Translates an API error response into the current UI language.
 *
 * Migrated routes now return a stable UPPER_SNAKE_CASE code (e.g.
 * "CUSTOMER_NOT_FOUND") instead of a hardcoded Arabic string. This helper
 * looks the code up in apiErrors.*; if the string isn't a known code (i.e.
 * an older, not-yet-migrated route still returning raw Arabic text), it is
 * returned as-is so nothing breaks while the migration is in progress.
 *
 * Usage: toast.error(translateApiError(t, data.error, { remaining: 3 }))
 */
export function translateApiError(
  t: (key: string, vars?: Record<string, string | number>) => string,
  codeOrMessage: string | undefined | null,
  vars?: Record<string, string | number>
): string {
  if (!codeOrMessage) return t("apiErrors.GENERIC_ERROR");
  const isCode = /^[A-Z][A-Z0-9_]*$/.test(codeOrMessage);
  if (!isCode) return codeOrMessage; // legacy Arabic message from an unmigrated route
  const translated = t(`apiErrors.${codeOrMessage}`, vars);
  // t() falls back to returning the key itself when missing — detect that
  // and fall back to the raw code so we never show "apiErrors.SOMETHING".
  return translated.startsWith("apiErrors.") ? codeOrMessage : translated;
}
