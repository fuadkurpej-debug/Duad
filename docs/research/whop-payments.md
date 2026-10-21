# Whop as the payment layer for an externally hosted physical-goods store (EN/SR Next.js + CJdropshipping)

**Research method and confidence:** whop.com and docs.whop.com cannot be reached from this environment. Everything below comes from WebSearch result summaries, run 25+ times, mostly in extended mode. No page was fetched directly.
- **CONFIRMED** means a search summary quoted or paraphrased an official Whop page (docs.whop.com, whop.com, or an official Whop npm or GitHub page). The URL is cited.
- **UNCERTAIN / UNVERIFIED** means the claim comes only from third-party sources, the sources conflict, or nothing was found.
- Several official docs pages were flagged as about 427 days old. Re-check field names against the live API reference before coding.

---

## TL;DR

- **Feasible:** Whop works as a pay-only layer for an external Next.js store. Your server creates a **checkout configuration** (`POST https://api.whop.com/api/v1/checkout_configurations`) with an inline one-time plan priced at the cart total and `metadata: { order_id }`. The customer then either goes to `purchase_url` or sees the `WhopCheckoutEmbed` component (from `@whop/checkout/react`) loaded with that `sessionId`. You fulfill when a `payment.succeeded` webhook arrives and passes verification.
- **Physical goods are only partly supported:**
  - There is a `collect_shipping_address` boolean and an embed `collectShipping` prop.
  - No shipping-rate or shipping-fee engine is documented.
  - Whop's own DTC docs say physical-product support is "still improving".
  - Whop announced a native ecommerce launch on Oct 1, 2026 (cart, variants, inventory, itemized sales tax). Third-party write-ups describe it and say Whop posted it on X and LinkedIn, but I could not reach the official announcement.
- **No Serbian checkout locale.** The documented locale codes are en, es, zh, nl, pt, de, it, fr, ja, pl and tr, plus hu in the Swift SDK.
- **Currency:** EUR is confirmed. RSD and BAM are **not confirmed** in Whop's currency enum.
- **Whop will not host your Next.js storefront.** Whop apps run in iframes inside whop.com. I found no evidence of custom-domain support for Whop store pages. Host the store yourself (for example on Vercel) and use Whop only for payments.

---

## 1. How an external website can charge a customer through Whop

### 1a. Checkout links (no code)
- **CONFIRMED:** You create links in the dashboard: Links tab → product → link icon next to a pricing option ([Create a Checkout Link](https://docs.whop.com/payments/create-checkout-link), [Checkout Links](https://docs.whop.com/checkout-links)).
- **CONFIRMED:** There are two ways to redirect after purchase:
  - Add an `onSuccess` parameter to the checkout URL.
  - Turn on "Redirect link" under Settings > Checkout. Only **one** redirect link is allowed per account ([Create a Checkout Link](https://docs.whop.com/manage-your-business/payment-processing/create-checkout-link)).
- Not useful for a dynamic cart, because each link is a fixed price.
- **UNVERIFIED:** I could not confirm the exact URL format (e.g. `whop.com/checkout/plan_...`).

### 1b. Checkout Configurations API (server-side, supports metadata) — the main route
- **CONFIRMED endpoint:** `POST https://api.whop.com/api/v1/checkout_configurations`, with a Bearer API key ([Create checkout configuration](https://docs.whop.com/api-reference/checkout-configurations/create-checkout-configuration)). Docs definition: "a reusable configuration for a checkout, including the plan, affiliate, and custom metadata."
- **CONFIRMED body fields** (seen in the reference, the guides and the quickstart):
  - Either `plan` (an inline plan object) or `plan_id`.
  - `metadata`
  - `mode`: `"payment"` or `"setup"`
  - `redirect_url`
  - `affiliate_code`
  - `checkout_styling`

  Sources: [Create checkout configuration](https://docs.whop.com/api-reference/checkout-configurations/create-checkout-configuration), [Save payment methods](https://docs.whop.com/developer/guides/save-payment-methods), [Next.js blog guide](https://whop.com/blog/add-checkout-to-nextjs-app/).
- **CONFIRMED inline plan fields:**
  - `title`
  - `plan_type`: `"one_time"` or `"renewal"`
  - `initial_price`
  - `currency`, as a lowercase ISO code such as `"usd"`
  - `release_method`: `"buy_now"` or `"waitlist"`
  - `visibility`
  - `company_id`
  - `custom_fields`: an array of `{name, field_type, placeholder, order, required, id}`
  - For subscriptions: `billing_period`, `renewal_price`, `expiration_days`

  Sources: [Quickstart](https://docs.whop.com/developer/quickstart), [Example Integration](https://docs.whop.com/developer/guides/example-integration), [Plan object](https://docs.whop.com/api-reference/beta/plans/plan).
- **CONFIRMED:** The Quickstart creates a checkout configuration with an inline plan (`title: "Starter"`, `plan_type: "one_time"`, `initial_price: 10.0`, `currency: "usd"`) and logs `checkout.purchase_url` ([Quickstart](https://docs.whop.com/developer/quickstart)). An inline plan does **not** need a pre-existing product ID ([Whop blog: REST API](https://whop.com/blog/how-to-use-the-whop-api/)).
- **CONFIRMED response fields:** `id`, `purchase_url`, `redirect_url`, the nested `plan`, and `metadata` ([Retrieve checkout configuration](https://docs.whop.com/api-reference/checkout-configurations/retrieve-checkout-configuration)).
- **CONFIRMED required API-key permissions** (listed on the reference page and repeated by whopmcp.com):
  - `checkout_configuration:create`
  - `plan:create`
  - `access_pass:create`
  - `access_pass:update`
  - `checkout_configuration:basic:read`
- **CONFIRMED, with a unit caveat:** In the examples `initial_price` is in major units (10.0 means $10.00). **UNVERIFIED:** a community PR claims the minimum price is 1.00 ([GitHub PR](https://github.com/livetradingcoder/al-ai-fx/pull/7)).
- **UNCERTAIN:** Some sources put `company_id` inside `plan`; a setup-mode example puts it at the top level. Check the live schema.
- **Legacy API:** v2 `checkout_sessions` endpoints also exist under `api.whop.com/api/v2` ([v2 retrieve checkout session](https://docs.whop.com/api-reference/v2/checkout-sessions/retrieve-a-checkout-session)). Use v1 checkout configurations; the v1 docs and guides are where current development is happening.

### 1c. Embedded checkout on your own site (`@whop/checkout`)
- **CONFIRMED package and import:**
  - Install `@whop/checkout` from npm.
  - Import the React component `WhopCheckoutEmbed` from **`@whop/checkout/react`**.
  - The `@whop/react` npm page says the checkout embed "is now exported from @whop/checkout/react" ([Embed Checkout](https://docs.whop.com/payments/checkout-embed), [@whop/checkout npm](https://www.npmjs.com/package/@whop/checkout), [@whop/react npm](https://www.npmjs.com/package/@whop/react)).
- **CONFIRMED props and options:**
  - `planId` **or** `sessionId`. `sessionId` is the ID of a checkout configuration created via the API ("ch_…" in the examples); use it to attach metadata.
  - `returnUrl`: required for redirects from external payment providers; must be https (http is allowed only on localhost).
  - `onPaymentError`, `onPromoCodeChanged`.
  - `hideAddressForm` together with `setAddress()`. `onAddressValidationError` only works when `hideAddressForm` is true.
  - `collectShipping`: requests a shipping address even when the plan does not require one. Apple Pay supports this; Google Pay support is "pending".
  - `adaptivePricing`, with `onCurrenciesAvailable`, `onCurrencyChanged`, `getAvailableCurrencies()` and `setDisplayCurrency()`.
  - `setupFutureUsage: "off_session"`.
  - `hideSubmitButton`: needs `@whop/checkout@0.0.43` or later.

  Sources: [Embed Checkout](https://docs.whop.com/payments/checkout-embed), [Express checkout](https://docs.whop.com/developer/guides/express-checkout).
- **CONFIRMED return handling:** On return, read the `status` query parameter. `success` means the payment went through; `error` means it failed or was cancelled, so remount the checkout. The one-click button also returns `payment_id` on success ([One-click checkout button](https://docs.whop.com/payments/one-click-checkout-button)).
- **CONFIRMED:** Apple Pay and Google Pay on an embedded checkout require **domain verification**, either Whop-hosted via DNS or a self-hosted file ([Apple Pay docs](https://docs.whop.com/payments/apple-pay), [Express checkout](https://docs.whop.com/developer/guides/express-checkout)).
- **UNCERTAIN:** The `onComplete` callback signature conflicts between sources: `(sessionId, setupIntentId, result)` versus `(planId, receiptId)`. Check the installed type definitions.

### 1d. Whop Elements (newer, finer-grained, can carry a multi-item cart)
- **CONFIRMED:** The Checkout element is "a full hosted checkout for one or more plans", with an itemized summary, promo codes and buyer currency selection. You pass **one of** `plan`, `items`, or `checkoutConfiguration` ([Elements Checkout](https://docs.whop.com/elements/latest/checkout/overview)).
- **CONFIRMED how `items` works:**
  - It is a list of plans, each with a quantity (default 1).
  - "Every item must belong to the same seller and use compatible billing terms; the API validates the complete cart and prices it as one charge."
  - "The plan defines the price; nothing about amounts can be asserted client-side."
  - The cart is fixed at creation; changing it later is refused.
  - Fulfill from webhooks, not from a browser callback.
- **CONFIRMED:** Payments and memberships created from a checkout session inherit its metadata.
- **UNCERTAIN package names:**
  - `npm install @whop/elements-react @whop/elements` ([Elements beta getting started](https://docs.whop.com/elements/beta/getting-started)).
  - Another page uses `@whop/embeddable-components` ([SDK Elements](https://docs.whop.com/sdk/elements/whop-elements)).
  - Session ID prefixes also differ between pages (`chs_` versus `ch_`).
- **UNVERIFIED:** I did not find whether the REST `checkout_configurations` endpoint accepts an `items` array.

### 1e. Can one checkout carry an arbitrary cart total?
- **Yes, CONFIRMED pattern — one inline plan per order.** Whop's [Example Integration](https://docs.whop.com/developer/guides/example-integration) builds a checkout configuration whose inline plan has `plan_type: "one_time"`, `release_method: "buy_now"`, and `initial_price` taken from a variable amount, with `metadata` alongside. Costs of this approach:
  - Every order creates a new plan.
  - The checkout shows one line, not the individual items.
  - You must compute the total, including shipping, on the server.
- **Alternative — Elements `items` cart.** Create one Whop plan per SKU or variant and pass `items` with quantities. You get an itemized display, but must keep your catalog mirrored in Whop. **UNVERIFIED:** how a shipping fee would appear in that model; one option would be a "shipping" plan as its own line item.

### 1f. One-time vs recurring
- **CONFIRMED:** `plan_type` takes `one_time` or `renewal` ([Plan](https://docs.whop.com/api-reference/beta/plans/plan)).
- **CONFIRMED:** Adaptive pricing applies only to one-time payments ([Adaptive pricing](https://docs.whop.com/payments-and-billing/fees/adaptive-pricing)).
- For this store, use `one_time` only.

---

## 2. Physical products, shipping, taxes, and policy

**CONFIRMED (official):**
- **DTC e-commerce docs:** "Whop continues to improve support for selling physical products." The recommended setup is:
  - Use **custom fields on the pricing option** to collect shipping address, size and color.
  - Send orders to fulfillment via **webhooks (e.g., Zapier)**.

  Source: [DTC E-commerce](https://docs.whop.com/supported-business-models/dtc-ecommerce).
- **`collect_shipping_address`** is a boolean on Create product (`POST https://api.whop.com/api/v1/products`). It also appears inside the nested `product` object in Create checkout configuration and Create payment ([Create product](https://docs.whop.com/api-reference/products/create-product)). The snippets I saw did not describe its exact behavior.
- **Embed `collectShipping` prop:** Apple Pay supports shipping; Google Pay is pending ([Embed Checkout](https://docs.whop.com/payments/checkout-embed)).
- **Elements Checkout** collects whatever the seller configured, "including a shipping address for physical goods" ([Elements Checkout](https://docs.whop.com/elements/latest/checkout/overview)).
- **Whop marketing page** ([Physical Products](https://whop.com/network/solutions/physical-products/)):
  - Claims "merchant of record… we handle VAT, sales tax, fraud protection, and compliance".
  - Claims a connected **Shopify** store "syncs orders automatically".
  - This is marketing, not API documentation.

**Taxes:**
- **CONFIRMED** ([Taxes docs](https://docs.whop.com/payments-and-billing/fees/taxes)):
  - The managed "collect and remit" mode covers **US, EU, UK**.
  - The "calculate only, you remit" mode covers 90+ countries on Numeral's coverage list.
  - Outside these regions, sellers "usually need to evaluate tax requirements themselves."
- **CONFIRMED** ([Seller Terms](https://whop.com/seller-terms/)):
  - Whop is merchant of record only for card-network rules and settlement. For all other purposes, including VAT and sales tax, the seller is the supplier unless a Tax Mode is enabled.
  - The terms say the managed mode currently covers **18 US states**, which contradicts the docs.
- **Inference:** Serbia is not in the EU. Serbian VAT on sales to Serbian buyers is probably your responsibility. Get local advice.
- **UNCERTAIN:** The tax add-on fee is quoted as 0.5% by some third parties and 2% by others.

**Shipping fees:**
- **NOT FOUND:** No shipping-rate, shipping-zone or label feature appeared in any official source. Plan to include shipping in the server-computed total.
- **UNCERTAIN:** The Oct 1, 2026 "ecommerce stores" launch (cart, variants, inventory, itemized sales tax; demo at `store.whop.site`) is described only by third parties ([adsx](https://adsx.com/blog/whop-ecommerce-launch-2026), [shopiator](https://shopiator.com/blog/whop-ecommerce-stores-vs-shopify)), which say Whop posted it on X and LinkedIn. One of them says shipping rates "were not shown".

**Policy:**
- **CONFIRMED** ([Prohibited Businesses](https://docs.whop.com/trust-and-safety/trust-safety-overview/what-is-not-allowed-on-whop), [Prohibited Products & Services](https://whop.com/prohibited-products-and-services/), [Community Guidelines](https://docs.whop.com/trust-and-safety/trust-safety-overview/community-guidelines)):
  - Prohibited categories include alcohol and tobacco, cannabis, controlled substances and unregulated supplements, weapons, **counterfeit goods and unauthorized replicas**, and wildlife and artifacts.
  - A category is banned when every payment processor prohibits it.
  - On suspension, funds can be held for about 90 days, and up to 120–180 days.
- **NOT FOUND:** No Whop rule specific to dropshipping. Practical risks for CJ products: knock-off or replica items (counterfeit rule), and long shipping times leading to disputes.
- **Chargebacks:** The $15 per-chargeback fee comes from the Seller Terms as reported by third parties. The "below 1% dispute rate over a rolling 90 days" figure is a third-party claim (chargewood); verify it.

---

## 3. Currencies, payouts, creating the business, API keys

**Currencies:**
- **CONFIRMED:** Plan `currency` is a three-letter lowercase ISO enum. It includes `usd`, `eur`, `gbp`, `cad`, `jpy` and many others, plus `whop_usd` and `btc` ([Plan](https://docs.whop.com/api-reference/beta/plans/plan), [List payments](https://docs.whop.com/api-reference/payments/list-payments), [Create payment](https://docs.whop.com/api-reference/payments/create-payment)).
- **NOT CONFIRMED:** `rsd` (Serbian dinar) and `bam` (Bosnian mark). Searches did not show them in the enum. Check the live Plan enum or the OpenAPI spec.
- **Recommendation:** Price in **EUR**. You can show approximate RSD on your own site.
- **CONFIRMED adaptive pricing** ([Adaptive pricing](https://docs.whop.com/payments-and-billing/fees/adaptive-pricing), [Embed](https://docs.whop.com/payments/checkout-embed)):
  - Off by default.
  - The buyer's region is detected by IP.
  - One-time payments only.
  - Buyers in unsupported regions see the original currency.
  - The supported-country list was not found.

**Fees** (third-party, verify at [docs.whop.com/fees](https://docs.whop.com/fees)):
- 2.7% + $0.30 per domestic card payment.
- +1.5% for international cards.
- +1% for currency conversion.
- $15 per dispute.

**Payouts:**
- **CONFIRMED** ([Set Up Payouts](https://docs.whop.com/manage-your-business/manage-payouts/set-up-payouts)):
  - Payouts reach over 200 countries.
  - Balances are converted to the currency of the region chosen when the organization was set up.
- **UNVERIFIED — Serbia on the payout list:** one search summary said Serbia is listed; two others saw truncated lists.
- **CONFIRMED:** Serbia is not on the sanctioned list ([Sanctioned Countries](https://docs.whop.com/trust-and-safety/trust-safety-overview/sanctioned-countries)).
- **CONFIRMED:** Identity verification (KYC) is required under the Seller Terms.
- Check the payout country selector in the new business before building.

**Creating a new business:**
- **CONFIRMED:** One login can own several businesses, with a business switcher in the dashboard. The docs call a business an "account": "the Account that owns API keys, products, webhooks, and payments" ([Quickstart](https://docs.whop.com/developer/quickstart)).
- **Third-party only (UI wording may change):** a "+ new business" button at the bottom of your whop list ([seedlycrm guide](https://seedlycrm.com/learning/whop-setup)).

**API keys:**
- **CONFIRMED** ([Getting started](https://docs.whop.com/developer/api/getting-started)):
  - Company API keys (called "Account API keys" on newer pages) are created on the business's **Developer** page.
  - You choose a role or custom permissions when creating a key and can add permissions later.
  - These keys are for acting on your own company.
- Because the business owns its keys, products, webhooks and payments, create the key **inside the new business**.
- **CONFIRMED env var:** `WHOP_API_KEY` ([Quickstart](https://docs.whop.com/developer/api/quickstart)). Older guides use `WHOP_COMPANY_API_KEY`.
- **CONFIRMED:** The company ID has the form `biz_…` and appears in the dashboard URL.

**Sandbox:**
- **CONFIRMED** ([Sandbox](https://docs.whop.com/developer/guides/sandbox), [Troubleshooting](https://docs.whop.com/developer/troubleshooting)):
  - API: `https://sandbox-api.whop.com/api/v1`. Dashboard: `https://sandbox.whop.com`.
  - Sandbox keys, plans and webhooks are separate from production.
  - Using a key against the other environment returns 401.
- **Third-party caveats** ([Whop blog: sandbox](https://whop.com/blog/whop-sandbox/), [community starter](https://whop-saas-starter.vercel.app/docs/guides/sandbox)):
  - On the 1.x TypeScript SDK, set the base URL with the correctly cased `baseURL` option.
  - The base URL must end in `/api/v1`.

---

## 4. Localizing the checkout (Serbian?)

- **CONFIRMED (embed):** The `data-whop-checkout-locale` attribute takes codes such as "es", "fr", "pt". When it is omitted, the checkout follows the buyer's browser language ([Embed Checkout](https://docs.whop.com/payments/checkout-embed)). I did not confirm the React prop name.
- **CONFIRMED (Elements):** `locale` accepts `"en" | "es" | "zh" | "nl" | "pt" | "de" | "it" | "fr" | "ja" | "pl" | "tr"`, defaulting to `"en"`. The Swift SDK adds `"hu"`. Any other value falls back to the default ([SDK Elements](https://docs.whop.com/sdk/elements/whop-elements), [Elements beta](https://docs.whop.com/elements/beta/getting-started), [Elements Checkout](https://docs.whop.com/elements/latest/checkout/overview)).
- **There is no Serbian (`sr`) locale in any source.** Serbian buyers will see English, or one of the listed languages.
- **Mitigations:**
  - Keep the cart, address capture and order summary in Serbian on your own site.
  - Optionally capture the address yourself and use `hideAddressForm` + `setAddress()`.
  - Explicitly set `en` for SR users.
  - Whop also offers payment elements for a custom form you design, with PCI-isolated fields ([Accept Payments](https://docs.whop.com/developer/guides/accept-payments)). How far the field labels can be localized is **UNVERIFIED**.

---

## 5. Can Whop host the Next.js site?

- **CONFIRMED (Whop apps):**
  - Apps render **inside an iframe on whop.com**.
  - The developer hosts the app at a "Base URL" they configure.
  - The Next.js template's paths are `/experiences/[experienceId]`, `/dashboard/[companyId]` and `/discover`.
  - Whop passes an `x-whop-user-token` JWT on same-origin requests.
  - The React setup is `@whop/react` with the `WhopApp` provider.

  Sources: [Iframe SDK](https://docs.whop.com/developer/guides/iframe), [Authentication](https://docs.whop.com/developer/guides/authentication), [whop-nextjs-app-template](https://github.com/whopio/whop-nextjs-app-template), [Frosted UI](https://docs.whop.com/developer/guides/frosted_ui).
- This model suits tools for logged-in Whop members. It does **not** suit a public, SEO-indexed bilingual store.
- **CONFIRMED:** Each whop gets a Whop-hosted store page ([Whop blog: store page](https://whop.com/blog/whop-store-page/)).
- **NOT FOUND:** Custom-domain or DNS support for Whop store pages. The new ecommerce demo runs on `store.whop.site` (third-party report).
- **Realistic setup:** Host Next.js yourself (Vercel or similar) on your own domain, and use Whop only for checkout. Embed it on your domain after Apple/Google Pay domain verification, or redirect to `purchase_url`.

---

## 6. Recommended architecture: own cart → Whop checkout with metadata → webhook confirmation

1. **Cart and order on your site.**
   - Recompute prices and shipping on the server from your own catalog (CJ costs plus margin). Never trust totals sent by the client.
   - Create an `orders` row with status `pending_payment` and a generated `order_id`.
2. **Create the checkout configuration on the server** (Next.js route handler or server action).
   - Call `client.checkoutConfigurations.create({...})`. The client is built with `apiKey: process.env.WHOP_API_KEY`; the package is `@whop/sdk`. The `helpers` subpath is confirmed; check the exact import form of the main client.
   - Body:
     - `plan`: `{ plan_type: "one_time", release_method: "buy_now", initial_price: <total in EUR, major units>, currency: "eur", title: "Order #<id>", company_id? }`
     - `metadata`: `{ order_id }`
     - `mode`: `"payment"`
     - `redirect_url`: `https://yourdomain/{locale}/checkout/return?order=<id>`
   - Pass an **idempotency key** (shown as a second argument in a Whop blog tutorial; confirm the exact option).
   - Store the returned `id` and `purchase_url` on the order.
3. **Payment UI.** Choose one:
   - (a) Redirect to `purchase_url` (simplest).
   - (b) Render `<WhopCheckoutEmbed sessionId={id} returnUrl=... collectShipping />` from `@whop/checkout/react`.
   - (c) Use the Elements Checkout with `checkoutConfiguration`, or with `items` if you mirror SKUs as Whop plans.
4. **Return page.** Read `status` (`success` or `error`) for the UI only. Show "processing" and poll your own DB. Whop says not to treat the redirect as a sale ([Elements Checkout](https://docs.whop.com/elements/latest/checkout/overview)).
5. **Webhook** (`/api/webhooks/whop`):
   - **Create it:** in the business's Developer dashboard, or with `POST` to the webhooks endpoint (URL plus events array).
   - **Events:**
     - `payment.succeeded` triggers fulfillment.
     - Also handle `payment.failed` and `payment.pending` (async methods such as SEPA).
     - Subscribe to `refund.created`, `refund.updated`, `dispute.created`, `dispute.updated` and `dispute_alert.created`.

     Sources: [Webhooks](https://docs.whop.com/developer/guides/webhooks), [Refunds and Disputes](https://docs.whop.com/developer/guides/refunds-and-disputes).
   - **Verification:** Whop uses the Standard Webhooks spec (`webhook-id`, `webhook-timestamp` and `webhook-signature` headers).
     - Use `unwrapWebhook` from **`@whop/sdk/helpers`** with `key: process.env.WHOP_WEBHOOK_SECRET`. The secret starts with `ws_` (per the Whop sandbox blog).
     - Verify against the **raw body**; never JSON-parse it first.
     - Older SDKs used `webhooks.unwrap`, which Whop says the current SDKs dropped.
   - **Mapping back to your order:** the Payment object has `metadata`, described as "custom metadata stored on this payment… copied over to the checkout configuration", and also carries the checkout configuration ID ([Payment](https://docs.whop.com/api-reference/payments/payment)).
     - Look up `metadata.order_id`.
     - Fall back to the stored checkout configuration ID.
     - If needed, re-fetch the payment with the [Retrieve payment](https://docs.whop.com/api-reference/payments/retrieve-payment) endpoint.
     - **UNVERIFIED:** where exactly metadata sits inside the `payment.succeeded` payload. Confirm with a sandbox test event.
   - **Processing:** be idempotent (dedupe on `webhook-id` or the payment ID). Check that amount and currency match the order. Mark the order `paid`, then queue CJdropshipping order creation using the shipping address you collected.
6. **Refunds and disputes:** sync `refund.*` and `dispute.*` events to order status. Keep CJ tracking numbers as delivery evidence.

**Confirmed env vars:**
- `WHOP_API_KEY`
- `WHOP_WEBHOOK_SECRET`
- Sandbox API base `https://sandbox-api.whop.com/api/v1`. A `WHOP_API_BASE_URL` variable appears only for the CLI.
- A variable such as `WHOP_COMPANY_ID` would be your own naming convention; I did not find it in the docs.

**Open items to check in the new business before committing:**
1. Is RSD in the plan currency enum?
2. Does the payout selector offer Serbia?
3. What does `collect_shipping_address` do on an inline plan?
4. Is Whop's tax mode available for EU and non-EU buyers?
5. Is there a shipping-fee field in the new ecommerce features?
6. What are the current `@whop/checkout` props (locale, `onComplete`)?

---

## Sources

**Official Whop docs and pages**
- https://docs.whop.com/api-reference/checkout-configurations/create-checkout-configuration
- https://docs.whop.com/api-reference/checkout-configurations/retrieve-checkout-configuration
- https://docs.whop.com/api-reference/checkout-configurations/list-checkout-configurations
- https://docs.whop.com/developer/quickstart
- https://docs.whop.com/developer/api/quickstart
- https://docs.whop.com/developer/api/getting-started
- https://docs.whop.com/developer/guides/example-integration
- https://docs.whop.com/developer/guides/accept-payments
- https://docs.whop.com/developer/guides/save-payment-methods
- https://docs.whop.com/developer/guides/webhooks
- https://docs.whop.com/developer/guides/refunds-and-disputes
- https://docs.whop.com/developer/guides/sandbox
- https://docs.whop.com/developer/troubleshooting
- https://docs.whop.com/developer/guides/express-checkout
- https://docs.whop.com/developer/guides/iframe
- https://docs.whop.com/developer/guides/authentication
- https://docs.whop.com/developer/guides/frosted_ui
- https://docs.whop.com/payments/checkout-embed
- https://docs.whop.com/payments/one-click-checkout-button
- https://docs.whop.com/payments/apple-pay
- https://docs.whop.com/payments/create-checkout-link
- https://docs.whop.com/manage-your-business/payment-processing/create-checkout-link
- https://docs.whop.com/checkout-links
- https://docs.whop.com/elements/latest/checkout/overview
- https://docs.whop.com/elements/beta/getting-started
- https://docs.whop.com/sdk/elements/whop-elements
- https://docs.whop.com/api-reference/beta/plans/plan
- https://docs.whop.com/api-reference/products/create-product
- https://docs.whop.com/api-reference/payments/payment
- https://docs.whop.com/api-reference/payments/retrieve-payment
- https://docs.whop.com/api-reference/payments/create-payment
- https://docs.whop.com/api-reference/payments/list-payments
- https://docs.whop.com/api-reference/payments/payment-succeeded
- https://docs.whop.com/api-reference/v2/checkout-sessions/retrieve-a-checkout-session
- https://docs.whop.com/supported-business-models/dtc-ecommerce
- https://docs.whop.com/supported-business-models/saas
- https://docs.whop.com/payments-and-billing/fees/taxes
- https://docs.whop.com/payments-and-billing/fees/adaptive-pricing
- https://docs.whop.com/payments-and-billing/local-payment-methods
- https://docs.whop.com/fees
- https://docs.whop.com/manage-your-business/manage-payouts/set-up-payouts
- https://docs.whop.com/manage-your-business/manage-payouts/payout-methods
- https://docs.whop.com/trust-and-safety/trust-safety-overview/what-is-not-allowed-on-whop
- https://docs.whop.com/trust-and-safety/trust-safety-overview/community-guidelines
- https://docs.whop.com/trust-and-safety/trust-safety-overview/sanctioned-countries
- https://whop.com/prohibited-products-and-services/
- https://whop.com/seller-terms/
- https://whop.com/network/solutions/physical-products/
- https://whop.com/blog/add-checkout-to-nextjs-app/
- https://whop.com/blog/how-to-use-the-whop-api/
- https://whop.com/blog/whop-sandbox/
- https://whop.com/blog/whop-tax-service/
- https://whop.com/blog/whop-store-page/
- https://www.npmjs.com/package/@whop/checkout
- https://www.npmjs.com/package/@whop/react
- https://github.com/whopio/whop-nextjs-app-template

**Third-party (used only for items marked UNCERTAIN/UNVERIFIED)**
- https://adsx.com/blog/whop-ecommerce-launch-2026
- https://shopiator.com/blog/whop-ecommerce-stores-vs-shopify
- https://whopmcp.com/blog/whop-mcp-checkout-docs/
- https://github.com/livetradingcoder/al-ai-fx/pull/7
- https://seedlycrm.com/learning/whop-setup
- https://www.crispcheckout.com/guides/whop-shopify-integration
- https://membertape.com/whop/fees/
- https://brillay.com/resources/how-much-does-whop-take
- https://chargewood.com/blog/whop-dispute-thresholds-withdrawn
- https://pipedream.com/apps/shopify/integrations/whop/create-checkout-session-with-whop-api-on-new-customer-data-request-from-shopify-api-int_Oqs0L80v
- https://whop-saas-starter.vercel.app/docs/guides/sandbox