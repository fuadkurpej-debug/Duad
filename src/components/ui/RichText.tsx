import type { ReactNode } from "react";
import { BRAND, BUSINESS } from "@/config/brand";
import type { Messages } from "@/i18n/messages";
import { Placeholder } from "./Placeholder";

type BusinessKey = keyof typeof BUSINESS;
const BUSINESS_KEYS = Object.keys(BUSINESS) as BusinessKey[];

function isBusinessKey(k: string): k is BusinessKey {
  return (BUSINESS_KEYS as string[]).includes(k);
}

/**
 * Render a content string, resolving {{tokens}} (see src/content/types.ts)
 * and **bold** markup.
 */
export function RichText({ text, t }: { text: string; t: Messages }): ReactNode {
  const parts = text.split(/(\{\{[^}]+\}\}|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const token = part.slice(2, -2).trim();
      if (token === "brand") return BRAND.fullName;
      if (token === "brandName") return BRAND.name;
      if (token.startsWith("tbd:")) {
        return <Placeholder key={i} label={token.slice(4).trim()} tooltip={t.placeholder.tooltip} />;
      }
      if (isBusinessKey(token)) {
        const value = BUSINESS[token];
        if (value) return value;
        return <Placeholder key={i} label={t.placeholder[token]} tooltip={t.placeholder.tooltip} />;
      }
      return <Placeholder key={i} label={t.placeholder.tbd} tooltip={t.placeholder.tooltip} />;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/** Plain-text version (for meta descriptions): tokens become their value or are removed. */
export function plainText(text: string): string {
  return text
    .replace(/\{\{\s*brand\s*\}\}/g, BRAND.fullName)
    .replace(/\{\{\s*brandName\s*\}\}/g, BRAND.name)
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
