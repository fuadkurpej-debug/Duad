import { BRAND } from "@/config/brand";
import { localeMeta, type Locale } from "@/i18n/config";

const cache = new Map<Locale, Intl.NumberFormat>();

/** Format an amount in the store currency for the given locale ("€24.00" / "24,00 €"). */
export function formatPrice(amount: number, locale: Locale): string {
  let f = cache.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(localeMeta[locale].intl, {
      style: "currency",
      currency: BRAND.currency,
      minimumFractionDigits: 2,
    });
    cache.set(locale, f);
  }
  return f.format(amount);
}
