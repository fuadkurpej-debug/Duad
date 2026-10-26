# My Store 2 — Shopify configuration record

Store: `wzdavt-r6.myshopify.com` · Currency: EUR · Recorded: 26 October 2026

This file records the store settings prepared for the Skin & Beauty project, so they can be checked or rebuilt. Nothing here is published, no payments were activated and no products were imported.

## Themes

| Theme | ID | Role |
| --- | --- | --- |
| Skin & Beauty | 187592474733 | Unpublished, the working theme (this repository) |
| Skin & Beauty — backup 2026-10-26 | 187893710957 | Unpublished backup taken before the supplier-ready changes |
| Horizon | 150569058413 | Live theme, untouched |

## Markets

| Market | Status | Countries | Currency |
| --- | --- | --- | --- |
| Montenegro | Active | ME | EUR |
| United States | Draft | US | EUR (the current payment setup supports one currency) |
| European Union | Draft | 27 EU countries | EUR |

## Shipping (General profile)

Locations: your own store location and `cjdropshipping` (the CJ fulfilment location was unassigned and has been added).

| Zone | Countries | Rate | Note |
| --- | --- | --- | --- |
| Domestic | ME | €9.60 Standard | Existing |
| United States | US | €17.00 Standard shipping | Placeholder until supplier quotes |
| European Union | All 27 EU countries | €17.00 Standard shipping | Placeholder; BG, HR, CY, EE, GR, HU, LV, LT, LU, MT, RO, SK, SI added |
| International | AE, AU, CA, CH, GB, HK, IL, JP, KR, MY, NO, NZ, SG | €17.00 International | Existing |

## Installed apps (as found)

CJdropshipping (fulfilment service with inventory management), Shopify Flow, Judge.me Reviews, Digital Products, Messaging. Syncee is not installed. Shopify Collective is not available for this store's country and currency.

## Collections

Smart collections route products by product type or tag, so imported products sort themselves.

| Collection | Handle | Tags (any of) |
| --- | --- | --- |
| Skincare | `skincare` | skincare, cleanser, serum, moisturizer, eye-care, face-mask, toner, sunscreen |
| Facial Cleansers | `facial-cleansers` | cleanser |
| Serums | `serums` | serum |
| Moisturizers | `moisturizers` | moisturizer, eye-care |
| Face Masks | `face-masks` | face-mask |
| Body & Hair | `body-hair` | body-care, hair-care |
| Body Care | `body-care` | body-care |
| Hair Care | `hair-care` | hair-care |
| Beauty | `beauty` | beauty, makeup, lip-care, beauty-tool |
| Beauty Essentials | `beauty-essentials` | lip-care, beauty-tool |
| Brazilian Rituals | `brazilian-rituals` | brazilian-ritual |
| Gift Sets | `gift-sets` | gift-set |
| Best Sellers | `best-sellers` | All active products, sorted by sales |
| New Arrivals | `new-arrivals` | All active products, newest first |
| Our Own Line | `our-own-line` | Vendor "Skin & Beauty" |

## Main menu (`skin-beauty-main`)

- Shop All: New Arrivals, Best Sellers, Brazilian Rituals, Gift Sets, Our Own Line
- Skincare: Facial Cleansers, Serums, Moisturizers, Face Masks
- Body & Hair: Body Care, Hair Care, Brazilian Rituals
- Beauty: Beauty Essentials, Gift Sets
- Journal
- About Us

Links to collections without products are hidden on the live store by the theme.

## Product fields (metafield definitions)

Shown on the storefront: `custom.brand` (Brand shown on store), plus the existing `custom.subtitle`, `custom.benefits`, `custom.key_ingredients`, `custom.ingredients`, `custom.how_to_use`, `custom.skin_types`, `custom.texture`, `custom.size`, `custom.shipping_estimate`, `custom.lowest_price_30_days`, `custom.pairs_with`.

Admin only (not on the storefront): `sourcing.supplier`, `sourcing.supplier_url`, `sourcing.unit_cost`, `sourcing.shipping_cost`, `sourcing.ships_to`, `sourcing.eu_compliance`, `sourcing.us_compliance`, `sourcing.verification_notes`, `sourcing.eu_responsible_person`, `sourcing.cpnp_reference`, `sourcing.documents`, `sourcing.supplier_sku`. Supplier and compliance status can be filtered in the product list.

## Research database

The product, supplier, compliance, inquiry, payment, automation and shipping research lives in the Google Sheet "Skin & Beauty Product and Supplier Database" in the owner's Google Drive (private). `docs/sourcing-report.html` is a standalone copy of the sourcing report.
