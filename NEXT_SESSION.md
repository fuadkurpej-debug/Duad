# NEXT SESSION — start here

Project: bilingual (EN / SR ijekavian Latin) premium Home & Living storefront.
Stack: Next.js 15 (App Router) + TypeScript + Tailwind v4. Payments (Whop) and
fulfillment (CJdropshipping) are interface stubs only — NOTHING is live.

## Status: WORK IN PROGRESS — does not build yet

### Done
- Config: package.json, tsconfig, next.config.ts, postcss, .env.example (flags default OFF)
- i18n: src/i18n/config.ts, messages/en.ts + sr.ts (sr is type-checked against en)
- Localised routing: src/lib/routes.ts (/en/shop <-> /sr/prodavnica, hreflang helper)
- Data model: src/data/types.ts, categories.ts (7 categories, EN+SR)
- Products: src/data/products/kitchen-dining.ts (4 products) ONLY
- Commerce boundaries: src/commerce/* (payments/whop.ts + fulfillment/cjdropshipping.ts throw "not implemented"),
  API stubs src/app/api/checkout and api/webhooks/whop (return 503 while disabled)
- Design tokens: src/app/globals.css
- Components: Header, LanguageSwitcher, MobileMenu, Footer, AnnouncementBar, Logo, CartProvider (localStorage),
  CartDrawer, CartLineRow, QuantityControl, ProductCard, ProductArt, Price, Placeholder, RichText, NewsletterForm
- Research (web-search based, verify before coding): docs/research/*.md

### TODO (in order)
1. BRAND DECISION: research (docs/research/brand-screening.md) found an existing Belgrade home-goods
   brand "Kutak". Recommended replacement: **Domna Living**. Update src/config/brand.ts, Logo, messages
   (strings mention "Kutak"), package.json name.
2. Write remaining product files (6): src/data/products/{home-organization,bathroom-essentials,living-decor,
   bedroom-comfort,smart-home,cleaning-care}.ts — 4 products each, same shape as kitchen-dining.ts.
3. Write SVG art files (7): src/components/art/products/<category>.tsx (see src/components/art/types.ts).
4. Content pages: src/content/pages/{about,faq,shipping,returns,privacy,terms}.ts (see src/content/types.ts).
5. App shell: src/app/[locale]/layout.tsx, [locale]/[[...slug]]/page.tsx (dispatcher using resolveRoute),
   not-found, middleware.ts (locale redirect + cookie), sitemap.ts, robots.ts.
6. Page components: Home, Shop (search/filter/sort), Category, Product, Cart, Checkout preview,
   Tracking preview, Contact, ContentPage (About/FAQ/policies).
7. QA: npm run typecheck, npm run build, Playwright desktop+mobile EN+SR.
8. Docs: README.md, PROJECT_STATUS.md, WHOP_INTEGRATION_PLAN.md.

## Rules (from the owner)
- Never touch the existing Whop business/wallet. New Whop business later via "+ Start Business".
- No fake reviews/certifications/delivery promises; sample products & prices clearly labelled.
- Use {{tbd:...}} / BUSINESS placeholders for unknown business facts.

## Commands
npm install
npm run dev   # http://localhost:3000
