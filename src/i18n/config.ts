export const locales = ["en", "sr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that remembers the visitor's explicit language choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeMeta: Record<
  Locale,
  {
    /** Value for <html lang> and hreflang. Serbian content is Latin script. */
    htmlLang: string;
    /** BCP 47 tag for Intl number/date formatting. */
    intl: string;
    /** Open Graph locale. */
    og: string;
    /** Short label shown in the switcher. */
    label: string;
    /** Full name, in its own language. */
    name: string;
  }
> = {
  en: { htmlLang: "en", intl: "en-IE", og: "en_GB", label: "EN", name: "English" },
  sr: { htmlLang: "sr-Latn", intl: "sr-Latn-ME", og: "sr_RS", label: "SR", name: "Srpski" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** A value that must exist in every supported language. */
export type Localized<T = string> = Record<Locale, T>;
