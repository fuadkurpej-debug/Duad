import type { Localized } from "@/i18n/config";

/**
 * Single source of truth for the brand. Renaming the brand later should only
 * require changing this file (plus the logo mark if desired).
 */
export const BRAND = {
  name: "Kutak",
  /** Used in titles, e.g. "Shop — Kutak Home". */
  fullName: "Kutak Home",
  tagline: {
    en: "Make every corner feel like home",
    sr: "Neka svaki kutak odiše toplinom doma",
  } satisfies Localized,
  /** Short descriptor for SEO and Open Graph. */
  descriptor: {
    en: "Considered home essentials for calm, organised everyday living.",
    sr: "Pažljivo birani predmeti za miran, uređen i topao dom.",
  } satisfies Localized,
  /** Currency used for the SAMPLE prices shown in the storefront. */
  currency: "EUR",
} as const;

/**
 * Business details that MUST be provided by the owner before launch.
 * Every value here is rendered through <Placeholder>, so it is visibly
 * marked as missing on the site. Never fill these with invented data.
 */
export const BUSINESS = {
  legalName: null as string | null,
  registeredAddress: null as string | null,
  registrationNumber: null as string | null,
  vatNumber: null as string | null,
  supportEmail: null as string | null,
  supportPhone: null as string | null,
  /** Country whose law governs the Terms. */
  governingLaw: null as string | null,
};
