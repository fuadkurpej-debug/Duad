/**
 * Structured long-form content (About, FAQ, policies).
 *
 * Text strings may contain tokens that are resolved at render time:
 *   {{brand}}             -> BRAND.fullName ("Kutak Home")
 *   {{brandName}}         -> BRAND.name ("Kutak")
 *   {{legalName}} {{registeredAddress}} {{registrationNumber}} {{vatNumber}}
 *   {{supportEmail}} {{supportPhone}} {{governingLaw}}
 *                         -> value from BUSINESS in src/config/brand.ts, or a
 *                            visible "to be confirmed" placeholder while null
 *   {{tbd:Short description}}
 *                         -> a visible placeholder for any other missing fact
 *                            (e.g. delivery times, return window). Never
 *                            invent such facts — use this token instead.
 *   **bold**              -> <strong>
 */
export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  /** Highlighted note, e.g. "This policy is a draft". */
  | { type: "note"; text: string }
  /** Question & answer (used by the FAQ). */
  | { type: "qa"; q: string; a: string[] };

export interface ContentSection {
  /** Stable anchor id, identical in every language (e.g. "returns-window"). */
  id: string;
  heading: string;
  blocks: ContentBlock[];
}

export interface ContentDoc {
  /** H1 of the page. */
  title: string;
  /** SEO meta description (max ~155 chars). */
  metaDescription: string;
  /** Short lead paragraph under the title. */
  intro: string;
  /** True for legal/policy drafts that need review before launch. */
  draft?: boolean;
  sections: ContentSection[];
}
