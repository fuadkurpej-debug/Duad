import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { Category, Product } from "@/data/types";
import { defaultLocale, isLocale, locales, type Locale, type Localized } from "@/i18n/config";

/**
 * Localised URL scheme. Every page exists in every locale, and each locale
 * has its own path segments, e.g.
 *   /en/collections/kitchen-dining  <->  /sr/kolekcije/kuhinja-i-trpezarija
 *
 * All internal links must be built with `href()` so the active language is
 * preserved and the language switcher can map any page to its counterpart.
 */

export type StaticRouteKey =
  | "home"
  | "shop"
  | "cart"
  | "checkout"
  | "tracking"
  | "about"
  | "contact"
  | "faq"
  | "shipping"
  | "returns"
  | "privacy"
  | "terms";

export type RouteRef =
  | { key: StaticRouteKey }
  | { key: "category"; categoryId: Category["id"] }
  | { key: "product"; productId: string };

const staticSegments: Record<StaticRouteKey, Localized<string[]>> = {
  home: { en: [], sr: [] },
  shop: { en: ["shop"], sr: ["prodavnica"] },
  cart: { en: ["cart"], sr: ["korpa"] },
  checkout: { en: ["checkout"], sr: ["placanje"] },
  tracking: { en: ["order-tracking"], sr: ["pracenje-narudzbe"] },
  about: { en: ["about"], sr: ["o-nama"] },
  contact: { en: ["contact"], sr: ["kontakt"] },
  faq: { en: ["faq"], sr: ["cesta-pitanja"] },
  shipping: { en: ["shipping"], sr: ["dostava"] },
  returns: { en: ["returns"], sr: ["povrat-i-refundacija"] },
  privacy: { en: ["privacy-policy"], sr: ["politika-privatnosti"] },
  terms: { en: ["terms"], sr: ["uslovi-koriscenja"] },
};

const collectionBase: Localized = { en: "collections", sr: "kolekcije" };
const productBase: Localized = { en: "products", sr: "proizvodi" };

export function segmentsFor(locale: Locale, ref: RouteRef): string[] {
  switch (ref.key) {
    case "category": {
      const c = categories.find((x) => x.id === ref.categoryId);
      if (!c) throw new Error(`Unknown category ${ref.categoryId}`);
      return [collectionBase[locale], c.slug[locale]];
    }
    case "product": {
      const p = products.find((x) => x.id === ref.productId);
      if (!p) throw new Error(`Unknown product ${ref.productId}`);
      return [productBase[locale], p.slug[locale]];
    }
    default:
      return staticSegments[ref.key][locale];
  }
}

/** Build a localised, absolute-path URL, e.g. href("sr", { key: "cart" }) -> "/sr/korpa". */
export function href(locale: Locale, ref: RouteRef, query?: Record<string, string>): string {
  const path = "/" + [locale, ...segmentsFor(locale, ref)].join("/");
  const qs = query ? new URLSearchParams(query).toString() : "";
  return qs ? `${path}?${qs}` : path;
}

export type ResolvedRoute =
  | { key: StaticRouteKey; ref: RouteRef }
  | { key: "category"; ref: RouteRef; category: Category }
  | { key: "product"; ref: RouteRef; product: Product };

/** Resolve URL segments (after the locale) to a page. Returns null for 404. */
export function resolveRoute(locale: Locale, segments: string[]): ResolvedRoute | null {
  const joined = segments.join("/");
  for (const key of Object.keys(staticSegments) as StaticRouteKey[]) {
    if (staticSegments[key][locale].join("/") === joined) return { key, ref: { key } };
  }
  if (segments.length === 2) {
    const [base, slug] = segments;
    if (base === collectionBase[locale]) {
      const category = categories.find((c) => c.slug[locale] === slug);
      if (category) return { key: "category", ref: { key: "category", categoryId: category.id }, category };
    }
    if (base === productBase[locale]) {
      const product = products.find((p) => p.slug[locale] === slug);
      if (product) return { key: "product", ref: { key: "product", productId: product.id }, product };
    }
  }
  return null;
}

/** Every page of the site, used for static generation and the sitemap. */
export function allRouteRefs(): RouteRef[] {
  return [
    ...(Object.keys(staticSegments) as StaticRouteKey[]).map((key) => ({ key }) as RouteRef),
    ...categories.map((c) => ({ key: "category", categoryId: c.id }) as RouteRef),
    ...products.map((p) => ({ key: "product", productId: p.id }) as RouteRef),
  ];
}

/** Map a full pathname (e.g. "/sr/korpa") to the same page in another locale. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  const current = parts[0];
  if (!isLocale(current)) return href(target, { key: "home" });
  const resolved = resolveRoute(current, parts.slice(1));
  return href(target, resolved ? resolved.ref : { key: "home" });
}

/** hreflang alternates for a page (relative paths; metadataBase makes them absolute). */
export function alternatesFor(locale: Locale, ref: RouteRef) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l === "sr" ? "sr-Latn" : l] = href(l, ref);
  languages["x-default"] = href(defaultLocale, ref);
  return { canonical: href(locale, ref), languages };
}
