import type { Localized } from "@/i18n/config";

export const categoryIds = [
  "kitchen-dining",
  "home-organization",
  "bathroom-essentials",
  "living-decor",
  "bedroom-comfort",
  "smart-home",
  "cleaning-care",
] as const;
export type CategoryId = (typeof categoryIds)[number];

/** Background tone of a product illustration tile. Maps to design tokens. */
export type ArtTone = "ivory" | "linen" | "sand" | "sage" | "taupe" | "oak" | "stone";

export interface Category {
  id: CategoryId;
  slug: Localized;
  name: Localized;
  /** One-line summary used on cards and in navigation. */
  short: Localized;
  /** Longer intro shown at the top of the collection page. */
  description: Localized;
  tone: ArtTone;
  /** Illustration kind used for the category tile (any product art kind). */
  artKind: string;
}

export interface VariantOption {
  id: string;
  label: Localized;
  /** Optional colour used for the swatch and to tint the illustration. */
  swatch?: string;
}

export interface ProductVariantGroup {
  /** e.g. "Colour" / "Boja" */
  name: Localized;
  options: VariantOption[];
}

export interface ProductSpec {
  label: Localized;
  value: Localized;
}

/**
 * Mapping to a supplier product. Every field stays null until a real supplier
 * product has been selected and verified. See docs/FULFILLMENT_PLAN.md.
 */
export interface SupplierMapping {
  provider: "cjdropshipping";
  /** CJ product id (pid). */
  productId: string | null;
  /** CJ variant id (vid) per storefront variant option id ("default" if no variants). */
  variantIds: Record<string, string | null>;
}

export interface Product {
  /** Stable internal id, e.g. "kd-01". Never shown to customers. */
  id: string;
  category: CategoryId;
  slug: Localized;
  name: Localized;
  /** Short line under the name on product cards (max ~60 chars). */
  tagline: Localized;
  /** 2–3 short paragraphs. */
  description: Localized<string[]>;
  /** 3–5 concise benefit bullets. Same count in every language. */
  benefits: Localized<string[]>;
  specs: ProductSpec[];
  /** SAMPLE price in BRAND.currency. Not a real offer. */
  price: number;
  variants?: ProductVariantGroup;
  art: { kind: string; tone: ArtTone };
  /** Shown in "Featured pieces" on the homepage. */
  featured?: boolean;
  supplier: SupplierMapping;
}
