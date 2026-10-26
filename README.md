# Skin & Beauty

Shopify theme and project documents for **Skin & Beauty**, a curated skincare, body care, hair care and beauty store (My Store 2, `wzdavt-r6.myshopify.com`). The brand name is temporary until the final name is confirmed.

## What is in this repository

| Path | Contents |
| --- | --- |
| `assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/` | The Skin & Beauty Online Store 2.0 theme, identical to the unpublished theme `Skin & Beauty` (ID 187592474733) on 26 October 2026 |
| `docs/supplier-import-guide.md` | How to import CJ Dropshipping, Syncee or Selfnamed products so they land in the right collections and look right |
| `docs/store-configuration.md` | Record of the store setup: markets, shipping zones, collections, menu, product fields |
| `docs/sourcing-report.html` | Supplier comparison, product shortlist, margin calculator, compliance notes and approval checklist (open in a browser) |

## Using the theme

The theme files sit at the repository root, so this branch can be connected through Shopify's GitHub integration (Online Store → Themes → Add theme → Connect from GitHub), or zipped and uploaded:

```sh
zip -r skin-beauty-theme.zip assets config layout locales sections snippets templates
```

Theme highlights:

- Supplier names such as "CJ Dropshipping" are never shown; the real maker can be set in the product field "Brand shown on store" (`custom.brand`).
- Long imported descriptions get a "Read more" link; supplier inline styles are cleaned up.
- Desktop galleries show a set number of images with a "Show all" button; mobile keeps every image swipeable.
- Colour variants use each variant's own image as a swatch.
- Collections, menu links and homepage sections stay hidden on the live store until they have products.
- Reviews, ratings, sale badges and free-shipping messages only appear from real data.

## Status

Nothing is published. Payments are not activated, the United States and European Union markets are drafts, and no supplier products have been imported yet. See the approval checklist in `docs/sourcing-report.html`.
