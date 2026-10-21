"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/components/I18nProvider";
import { LOCALE_COOKIE, localeMeta, locales, type Locale } from "@/i18n/config";
import { switchLocalePath } from "@/lib/routes";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

function Switcher({ variant, query }: { variant: "header" | "menu"; query: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname() || "/";

  return (
    <nav aria-label={t.language.label} className={variant === "menu" ? "w-full" : undefined}>
      <ul
        className={
          variant === "header"
            ? "flex items-center text-[0.78rem] font-semibold tracking-[0.12em]"
            : "grid grid-cols-2 gap-2"
        }
      >
        {locales.map((l, i) => {
          const active = l === locale;
          const target = switchLocalePath(pathname, l) + (query ? `?${query}` : "");
          return (
            <li key={l} className="flex items-center">
              {variant === "header" && i > 0 && <span className="mx-1.5 h-3 w-px bg-charcoal/25" aria-hidden="true" />}
              <Link
                href={target}
                hrefLang={localeMeta[l].htmlLang}
                lang={localeMeta[l].htmlLang}
                aria-current={active ? "true" : undefined}
                aria-label={`${t.language.switchTo} ${localeMeta[l].name}`}
                onClick={() => rememberLocale(l)}
                scroll={false}
                className={
                  variant === "header"
                    ? `inline-flex min-h-11 min-w-9 items-center sm:min-w-10 justify-center rounded-full px-1.5 transition-colors ${
                        active ? "text-charcoal" : "text-taupe hover:text-charcoal"
                      }`
                    : `flex min-h-12 items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-colors ${
                        active ? "border-charcoal bg-charcoal text-paper" : "border-line text-charcoal hover:border-charcoal"
                      }`
                }
              >
                {variant === "header" ? (
                  <span className={active ? "border-b border-charcoal pb-0.5" : "pb-0.5"}>{localeMeta[l].label}</span>
                ) : (
                  <>
                    <span>{localeMeta[l].label}</span>
                    <span className="font-normal opacity-80">{localeMeta[l].name}</span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function WithQuery({ variant }: { variant: "header" | "menu" }) {
  const sp = useSearchParams();
  return <Switcher variant={variant} query={sp.toString()} />;
}

/**
 * EN | SR switcher. Links to the SAME page in the other language (localised
 * slugs are mapped through the route table) and keeps the query string,
 * e.g. shop filters. The choice is remembered in a cookie.
 */
export function LanguageSwitcher({ variant = "header" }: { variant?: "header" | "menu" }) {
  return (
    <Suspense fallback={<Switcher variant={variant} query="" />}>
      <WithQuery variant={variant} />
    </Suspense>
  );
}
