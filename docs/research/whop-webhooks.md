# Whop webhooks, order data, refunds and apps (research as of 2026-10-21)

**How this was researched:** I couldn't fetch whop.com or docs.whop.com directly, so every finding comes from WebSearch result summaries of those pages.
- **CONFIRMED** means an official Whop docs page (docs.whop.com / dev.whop.com) says it, according to the search summary. Check exact field names on the page before you write code against them.
- **UNVERIFIED** means it comes from a third-party source, a Whop marketing blog, or my own inference. Treat it as a hypothesis to test in the Whop sandbox.
- The Whop docs contradict themselves in several places (old and new SDKs, renamed fields, different event lists). Those conflicts are flagged below.

---

## TL;DR for the build

1. **Fulfill orders from the `payment.succeeded` webhook, not the browser redirect.** Whop's docs say this explicitly. Put your own order ID in the checkout configuration's `metadata`; it comes back on the event. (CONFIRMED)
2. **Verify signatures with `unwrapWebhook` from `@whop/sdk/helpers`.** Pass the raw body, the headers, and the `ws_...` secret unchanged. The older `webhooks.unwrap` / `webhookKey` / `btoa(secret)` pattern is deprecated. The docs say the new helper "lands in the next release", so check which SDK version you have installed. (CONFIRMED, with that version caveat)
3. **Shipping address:** the payment object has a nullable `shipping_address` field (`name, line1, line2, city, state, postal_code, country`), described as "the shipping address provided by the customer for physical goods". Nobody has confirmed it is reliably filled in for your checkout flow. Test it in the sandbox with `collectShipping` turned on. (Field: CONFIRMED. Filled in reliably: UNVERIFIED)
4. **Refunds:** `POST /api/v1/payments/{id}/refund` with an optional `partial_amount` (decimal, in the payment's currency). Leaving it out gives a full refund. (CONFIRMED)
5. **Whop Apps:** you could technically run a storefront inside a Whop app "experience", but it's a poor fit for a public SEO storefront. Build the Next.js site on its own and embed Whop checkout instead. (Mostly my inference; see section 4)
6. **Rate limit:** 600 requests/min by default, counted separately per API operation and per credential. Going over returns `429 rate_limit_exceeded`. (CONFIRMED)
7. **New:** Whop announced "ecommerce stores end-to-end" around 1 Oct 2026, covering multi-product checkout, variants, inventory and itemized sales tax. This comes from Whop's X post and third-party blogs; I found no detailed official docs yet. (UNVERIFIED in detail)

---

## 1. Webhooks

### 1.1 Event types relevant to orders

| Area | Events | Status |
|---|---|---|
| Payments | `payment.created`, `payment.pending`, `payment.authorized`, `payment.canceled`, `payment.succeeded`, `payment.failed` | CONFIRMED (webhooks guide / create-webhook reference). An older reference page also lists `payment.requires_action`, which may be legacy. |
| Refunds | `refund.created`, `refund.updated` | CONFIRMED (refunds-and-disputes guide, "Refund created" reference page) |
| Disputes | `dispute.created`, `dispute.updated`, `dispute_alert.created` (pre-dispute alert) | CONFIRMED (refunds-and-disputes guide, "Dispute created" reference) |
| Memberships | `membership.activated`, `membership.deactivated`, `membership.trial_ending_soon`, `membership.cancel_at_period_end_changed` | CONFIRMED in the reference. **Conflict:** the memberships guide talks about a `membership.updated` event. The legacy names `membership.went_valid` / `went_invalid` are no longer in the list (a third-party GitHub PR says so). |
| Invoices | `invoice.created`, `invoice.paid`, `invoice.past_due`, `invoice.voided`, `invoice.marked_uncollectible` | CONFIRMED (reference), but not needed for one-time product sales |

- What the dispute events mean: `dispute.created` means a formal dispute is open and the response window has started. Its payload includes `needs_response_by` and `status`. `dispute.updated` tracks the status moving from `needs_response` to `under_review` to `won`/`lost`. (CONFIRMED)
- For a one-time physical-goods store, membership events are probably irrelevant. I couldn't confirm whether a one-time purchase also creates a membership object (UNVERIFIED). The search summaries do show `membership`, `plan` and `product` on the payment object.
- The docs warn that the event lists differ between doc pages and API versions. Confirm the final list in the dashboard.

### 1.2 Payload envelope (CONFIRMED, current v1 format)

```json
{
  "id": "<unique webhook message id>",
  "type": "payment.succeeded",
  "api_version": "v1",
  "api_version_date": "2026-08-14",
  "timestamp": "2026-08-10T17:03:24.291Z",
  "account_id": "biz_...",
  "data": { "id": "pay_...", "...": "full payment object" }
}
```

- **Account field naming:** webhooks pinned to an `api_version_date` before **2026-08-14**, or with no pin at all, receive `company_id` instead of `account_id`. Handle both. (CONFIRMED in the webhooks reference)
- An older Whop guide shows an envelope that uses `action` instead of `type`. That's the outdated v2/v5 format, so ignore it.
- **Metadata:** the Accept Payments guide says `payment.succeeded` carries the metadata you attached to the checkout configuration (CONFIRMED). Whop's example integration reads it as `data.metadata.<key>`. The `payment.succeeded` reference page snippet didn't list `metadata` explicitly, so confirm the exact path with a test event.
- **Status check:** a Whop blog post says to check `substatus === "succeeded"` and not `status`. The `status` field holds lifecycle values like `draft`, `open`, `paid`, `pending`, `void`, `uncollectible`, `unresolved`. `substatus` holds friendly values like `succeeded`, `pending`, `failed`, `refunded`, `partially_refunded`, `auto_refunded` plus dispute states. Both enums are CONFIRMED in the reference. The "check substatus" advice is from the blog, which is official Whop but not the reference.
- **Required permissions** for the `payment.succeeded` event include `webhook_receive:payments`, `payment:basic:read` and `member:email:read`, among others. (CONFIRMED)

### 1.3 Signature verification (Standard Webhooks)

- Whop webhooks follow the **Standard Webhooks** spec. (CONFIRMED)
- Headers are `webhook-id`, `webhook-timestamp` and `webhook-signature` (value format `v1,<base64>`). The header names come from the Standard Webhooks spec and third-party PRs. The Whop docs confirm Standard Webhooks generally, and a third-party guide confirms the `webhook-signature` header.
- **Current helper (CONFIRMED in the webhooks guide and troubleshooting page):**
  ```ts
  import { unwrapWebhook } from "@whop/sdk/helpers";
  const raw = await request.text();               // RAW body — do not JSON.parse first
  const event = unwrapWebhook(raw, {
    headers: Object.fromEntries(request.headers),
    key: process.env.WHOP_WEBHOOK_SECRET!,         // "ws_..." as-is: don't strip prefix, don't base64
  });
  if (event.type === "payment.succeeded") { /* ... */ }
  ```
  - The docs say the `webhooks.unwrap` method and the `webhookKey` client option "belonged to the older SDKs" and that every current SDK drops both.
  - **Caveat:** the docs also say these helpers "land in the next release", and a DeepWiki page still documents `webhooks.unwrap()`. Check which one your installed `@whop/sdk` version exports.
  - **Fallback (UNVERIFIED, third-party):** use the `standardwebhooks` npm package with `new Webhook(secret, { format: "raw" })` for `ws_` secrets.
  - The Python helper is `whop_sdk.lib.verify_webhook.unwrap`.
- In Next.js App Router, read the body with `await req.text()` in a route handler (`runtime = "nodejs"`) so the bytes stay unchanged. This is my recommendation, not something Whop's docs say.

### 1.4 Registering endpoints

- **Dashboard:** Developer > Webhooks. Add an HTTPS URL, keep the API version on v1, select the events, then copy the signing secret from the "Secret" column into `WHOP_WEBHOOK_SECRET`. (CONFIRMED)
- **API:** `POST https://api.whop.com/api/v1/webhooks` with a Bearer key. It needs the `developer:manage_webhook` permission. (CONFIRMED)
  - The minimal body is `{ url, events: [...] }`. The request sample also shows `api_version_date`, `child_resource_events` (boolean; only matters for platforms with sub-merchants), `enabled` and `resource_id`.
  - The response includes `id`, `url`, `events`, `resource_id`, `api_version` and `webhook_secret`.
- **Company vs app webhooks:** `resource_id` is the company or app that owns the webhook. The list endpoint takes an `app_id` filter; leave it out to get the company's own webhooks. For this store you want **company** webhooks, using a **company API key** (Dashboard > Developer > Company API keys). (CONFIRMED that these options exist. That this is the right choice for you is my recommendation.)
- **Sandbox** is a separate environment with its own dashboard, keys and webhooks. (CONFIRMED) A Whop blog lists test card `4242 4242 4242 4242` for a successful payment.

### 1.5 Test events

- **Dashboard:** open the webhook row's menu and send a test event. (CONFIRMED)
- **API/SDK:** a "Send test event" operation exists and needs `developer:manage_webhook`. One search summary gave the path as `POST /api/v1/webhooks/{id}/test`; check the reference before relying on that path. (Operation CONFIRMED, path UNVERIFIED)
- The webhook object lists only a **subset** of events as testable. Not every subscribed event can be test-fired. (CONFIRMED)

### 1.6 Delivery semantics

- Delivery is **at-least-once**, so duplicates happen. Retries reuse the same `webhook-id`; use it, or the payment ID, to deduplicate. (CONFIRMED)
- Respond with a 2xx **within 5 seconds**, otherwise Whop retries. Redirects aren't followed. Acknowledge first and do the fulfillment work (the CJdropshipping order call) in a background job or queue. (CONFIRMED)
- **Retry schedule:** about 12 retries over roughly 3 days, with delays growing from 30s to 2m, 8m and 30m. One search summary attributed this to the webhooks guide; a second search couldn't confirm the intervals. (PARTIALLY CONFIRMED)
- **Endpoint disabled after 72 hours of failures:** only a third-party (Pinggy) blog says this. (UNVERIFIED)

---

## 2. Getting payment details and customer data

### 2.1 Endpoints (CONFIRMED)

- `GET https://api.whop.com/api/v1/payments/{id}` (SDK `client.payments.retrieve(id)`). It needs several read scopes, including payment, plan, member, dispute and **`member:email:read`**.
- `GET https://api.whop.com/api/v1/payments` (SDK `client.payments.list({ company_id: "biz_..." })`).
  - Pagination is cursor-based (`after` / `before` / `first` / `last`), with a `direction` parameter. The SDK can auto-paginate.
  - The docs say you can filter by product, plan, status, billing reason, currency and creation date. The exact parameter names (`product_ids`, `statuses`, `created_after`, …) are UNVERIFIED.

### 2.2 Customer data on the payment object

| Data | Field (per docs) | Status |
|---|---|---|
| Name / username / ID | `user.{id, name, username}` | CONFIRMED |
| Email | `user.email`. Needs `member:email:read`, otherwise **null** | CONFIRMED |
| Phone | A customer phone field appears in the Payment reference example | Exists (CONFIRMED); exact field name UNVERIFIED |
| Billing address | `billing_address.{name, line1, line2, city, state, postal_code, country}`, described as "the address of the user who made the payment" | CONFIRMED |
| Shipping address | `shipping_address` with the same shape. Nullable. "The shipping address provided by the customer for physical goods." | Field CONFIRMED (retrieve/list/refund/retry pages) |
| Shipment | `shipment` object. Needs `shipment:basic:read` | CONFIRMED |
| Link to checkout | Checkout configuration ID on the payment | CONFIRMED |
| Your order ID | `metadata` (from the checkout configuration) | Comes back on the webhook per the guide (CONFIRMED). Exact location on the retrieved payment object UNVERIFIED |
| Refunds | List of refunds on the payment, newest first, including failed and canceled attempts | CONFIRMED |
| Amounts | `total`, `subtotal`, `currency`, `tax_refunded_amount`, … | Seen in examples (some were null in samples); exact semantics UNVERIFIED |

### 2.3 Shipping address: what is and isn't known

- **CONFIRMED:**
  - `shipping_address` exists on the payment object as an object-or-null.
  - In the `payment.pending` webhook example it is `null`, along with `shipment: null`.
  - The embedded checkout has a `collectShipping` prop (React `WhopCheckoutEmbed`) and a `data-whop-checkout-collect-shipping="true"` attribute (HTML embed). Both force an address prompt "even when the plan doesn't require one". They work in the regular embedded checkout and the one-click button. Apple Pay supports shipping; **Google Pay support is "pending"**. `shipping.address.hidden` hides the field.
  - Express wallet buttons collect the shipping address inside the wallet sheet for physical goods.
  - An `AddressElement` exists in Whop Elements.
- **UNVERIFIED / unclear:**
  1. Whether `shipping_address` is reliably filled in on `payment.succeeded` when the address is collected through `collectShipping`, wallet sheets, or the new ecommerce stores.
  2. Whether an address collected on a Google Pay payment ever shows up there.
  3. A search summary mentioned a `collect_shipping_address` flag on create-payment and create-checkout-configuration (under `product`). A second search found **no** docs for that snake_case name, only `collectShipping`. Treat `collect_shipping_address` as unconfirmed.
  4. How strictly addresses are validated (phone, apartment/house number formats for Serbian addresses, etc.).
- **Older official fallback:** Whop's DTC e-commerce page says "Whop continues to improve support for selling physical products". It recommends **custom fields** on the pricing option to collect shipping details, with Zapier webhooks for fulfillment.
  - Custom-field answers are documented on **entries** (`custom_field_responses`), not payments. I couldn't confirm how they attach to an ordinary paid checkout.
- **Recommendation for the build:**
  - Collect the shipping address **on your own Next.js checkout step** before creating the Whop checkout configuration, and store it with your order. Pass only `order_id` in `metadata`.
  - Treat Whop's `shipping_address` as a cross-check, not the source of truth. This avoids depending on an unverified field for CJdropshipping orders.
  - Keep metadata small. I didn't find the size limits.

### 2.4 Shipments API (useful for sending CJ tracking numbers back into Whop)

- `POST https://api.whop.com/api/v1/shipments`. The body example has `account_id` (in the example), `payment_id` and `tracking_code`. Needs `shipment:create` and `payment:basic:read`. (CONFIRMED)
- There's no carrier field in the request. The response has `id` (`ship_...`), `status`, `substatus`, `delivery_estimate`, `service` and the linked payment. I couldn't confirm whether the carrier is detected automatically from the tracking code or which carriers are supported.
- `GET /api/v1/shipments` filters by payment, company or user. (CONFIRMED)

---

## 3. Refund API

- **Create:** `POST https://api.whop.com/api/v1/payments/{id}/refund` (SDK `client.payments.refund(id, { partial_amount })`). (CONFIRMED)
  - Leave out `partial_amount` for a full refund.
  - `partial_amount` is a **decimal in the payment's currency**; the docs' examples use `6.9` and `5.0` = $5.
  - The refund goes through the original payment processor, and the membership status is updated accordingly.
  - Needs the `payment:manage` permission.
- **Retrieve:** `GET /api/v1/refunds/{id}` (`rf_...`). (CONFIRMED)
  - Fields seen: `id`, `amount` (decimal, e.g. 10.43 = $10.43), `currency`, `status`, `provider` (e.g. `stripe`), `provider_created_at`, `reference_status/type/value`, `created_at`, and a nested `payment`.
  - The nested `payment` can be null "if the original payment is no longer available".
  - The `refund.created` sample shows `amount: 50`, which is ambiguous. Test it.
- After a refund, the payment's `substatus` becomes `refunded`, `partially_refunded` or `auto_refunded`. (CONFIRMED enum)
- Refunds made from the dashboard (customer profile, Payments page or Resolution Center) also support partial amounts. They're "processed immediately", and if the Whop balance is too low you have to top it up first. (CONFIRMED, dashboard docs)
- **Disputes:** stage evidence with `client.disputes.update(id, { evidence: {...} })`, which can be called repeatedly. (CONFIRMED)
  - I couldn't retrieve the final "submit" call.
  - Dashboard docs say a dispute debits the disputed amount **plus a $15 fee**.
  - Early dispute alerts **auto-refund transactions under $500 by default**; the threshold can be changed in settings. Check this setting for a physical-goods store, because auto-refunds can happen after CJ has already shipped. (CONFIRMED per the manage-disputes summary)
- **UNVERIFIED:** whether the refund endpoint honours `Idempotency-Key`, whether processing fees are returned on full or partial refunds, any refund time limit, and the full `refund.status` enum. Make your refund calls idempotent yourself, for example by storing the refund intent with a unique key and checking `payment.refunds` before retrying.

---

## 4. Whop Apps: could the storefront be a Whop app "experience"?

### What the docs say (CONFIRMED)

- **Hosting:** apps are your own web apps, embedded by Whop in an **iframe** and served through a proxy at `https://{domain_id}.apps.whop.com` with a path per view.
- **Views:**
  - **Experience view:** customer-facing, shows up in the Whop sidebar next to chat, forums and courses. Recommended path `/experiences/[experienceId]`, plus `[restPath]` for deep links.
  - **Dashboard view:** for business admins. `/dashboard/[companyId]`.
  - **Discover view:** a public marketing page.
  - Paths are set in Developer dashboard > app > Hosting. A template README warns that the placeholder text there doesn't count as a saved value; you have to type the path in.
- **Auth:** Whop sends a short-lived JWT in the `x-whop-user-token` header on same-origin requests.
  - `verifyUserToken` is **not available in the current TypeScript `@whop/sdk`**; the docs say the TS snippets "won't run as written". Python and Ruby have helpers.
  - Check access with `checkAccess` (user ID + `exp_`/`prod_`/`biz_` ID), which returns `has_access` and `access_level` (`no_access` | `customer` | `admin`).
  - For an experience, `customer` means the user holds a membership to a product connected to that experience. The React Native docs use a different method name (`access.checkIfUserHasAccessToExperience`).
- **Iframe SDK** (`@whop/iframe`, or `@whop/react` with `WhopIframeSdkProvider` / `useIframeSdk`): uses `postMessage` and works only in client components. In-app purchases work like this: create a checkout configuration on the server, call `iframeSdk.inAppPurchase(...)`, get `{status: "ok", data: { receipt_id }}`, then confirm through webhooks.
- **Local development:** the dev proxy injects the user token on localhost.

### Fit for a public bilingual storefront (my inference, not stated by Whop)

- **Visibility:** an experience lives inside Whop, behind a Whop login, and is meant for people who already have access to a product connected to that experience. Anonymous shoppers and search engines won't see it. That breaks SEO, hreflang EN/SR URLs, ads landing pages and pixel attribution on your own domain.
- **Iframe limits:** client-only SDK, the Whop shell UI around your app, and CSP and cookie restrictions on third-party iframes.
- **Duplicate work:** you'd maintain two runtime contexts (standalone and in Whop) to reach the same customers.
- **Possible use:** a *secondary* channel later, for example a "shop" experience for members of a Whop community, with payment through `inAppPurchase`. It's not the primary storefront.

### Recommended setup instead (CONFIRMED components)

- Build the Next.js site on its own and embed Whop checkout with `WhopCheckoutEmbed` from `@whop/checkout/react`, or with the newer Whop Elements (`@whop/elements`, `@whop/elements-react`, `CheckoutElement`).
- Add `frame-src https://*.whop.com` and `script-src https://t.whop.tw` to your CSP.
- Whop Elements checkout accepts an **`items` array** of plans and quantities, priced as one charge. All items must belong to the same seller and have compatible billing terms. Passing `items` replaces `plan`/`quantity`/`checkoutConfiguration`. This fits a cart. How variants are referenced per line is UNVERIFIED.
- One-time prices can be defined inline in the checkout configuration: `plan: { plan_type: "one_time", currency, initial_price, ... }` plus `metadata`, with `redirect_url`. Whether `initial_price` is in units or cents is UNVERIFIED, though other amounts in the API are decimals.

---

## 5. Rate limits, idempotency, retries

- **Rate limits (CONFIRMED, Troubleshooting page):**
  - Default **600 requests/minute**, counted separately per API operation and per credential.
  - Going over returns **429 `rate_limit_exceeded`** with a retry delay in the message.
  - OAuth endpoints have their own short-window limits, and you should honour `Retry-After` if it's present.
  - The docs recommend exponential backoff for idempotent requests.
  - I couldn't confirm rate-limit response header names or how to get a higher limit.
- **SDK retries:** the `@whop/sdk` npm page says the SDK retries 429 and ≥500 responses by default. (CONFIRMED on npm)
- **Idempotency:**
  - An optional `Idempotency-Key` header (max 255 chars, "makes the request safe to retry") appears on some API reference pages, such as create-card (beta) and retry-payment, and links to an "Idempotent requests" guide I couldn't retrieve. (CONFIRMED that it exists on those endpoints)
  - **UNVERIFIED:**
    - A Whop marketing blog says responses are cached and replayed for **24h** and that the feature is under the "Experimental API".
    - A third-party guide says `@whop/sdk` 0.0.42 accepted an `idempotencyKey` option but never sent it, so you had to set the header manually.
    - Whether `checkoutConfigurations.create` and `payments.refund` honour the header.
  - To be safe, set the header explicitly (e.g. `order-<id>` / `refund-<id>-<n>`) and also deduplicate in your own database.
- **Webhooks:** see 1.6. Deduplicate on `webhook-id` and also enforce "one fulfillment per `pay_` ID". Respond within 5s and queue the CJ order creation.

---

## Open questions to settle in the Whop sandbox

1. Is `data.shipping_address` filled in on `payment.succeeded` for embedded checkout with `collectShipping`? What happens with Apple Pay, Google Pay and PayPal?
2. Where exactly does `metadata` appear (`data.metadata`?), and is it also on `GET /payments/{id}`?
3. Which `@whop/sdk` version exports `unwrapWebhook` from `@whop/sdk/helpers`?
4. Is `user.email` filled in with a company API key that has `member:email:read`?
5. Do `payments.refund` and `checkoutConfigurations.create` honour `Idempotency-Key`? What does the refund `status` enum contain?
6. What does `payment.succeeded` contain for a multi-item `items` cart (per-line breakdown, variants)?
7. Do the new "ecommerce stores" features (Oct 2026) have official API docs for variants, inventory and shipping rates?
8. Which currencies are supported (e.g. RSD vs EUR), and what are the payout and tax implications for a Serbian merchant? This was out of scope here.

---

## Sources

- https://docs.whop.com/developer/guides/webhooks
- https://docs.whop.com/developer/troubleshooting
- https://docs.whop.com/developer/quickstart
- https://dev.whop.com/webhooks
- https://dev.whop.com/webhooks/v5
- https://docs.whop.com/api-reference/webhooks/create-webhook
- https://docs.whop.com/api-reference/webhooks/webhook
- https://docs.whop.com/api-reference/webhooks/list-webhooks
- https://docs.whop.com/api-reference/beta/webhooks/retrieve-webhook
- https://docs.whop.com/sdk/api/webhooks/test-webhook
- https://docs.whop.com/api-reference/payments/payment-succeeded
- https://docs.whop.com/api-reference/payments/payment-failed
- https://docs.whop.com/api-reference/payments/payment-pending
- https://docs.whop.com/api-reference/payments/payment
- https://docs.whop.com/api-reference/payments/retrieve-payment
- https://docs.whop.com/api-reference/payments/list-payments
- https://docs.whop.com/api-reference/payments/refund-payment
- https://docs.whop.com/api-reference/payments/retry-payment
- https://docs.whop.com/api-reference/payments/create-payment
- https://docs.whop.com/api-reference/refunds/refund
- https://docs.whop.com/api-reference/refunds/retrieve-refund
- https://docs.whop.com/api-reference/refunds/refund-created
- https://docs.whop.com/api-reference/disputes/dispute-created
- https://docs.whop.com/developer/guides/refunds-and-disputes
- https://docs.whop.com/manage-your-business/manage-payments/issuing-refunds
- https://docs.whop.com/manage-your-business/manage-payments/manage-disputes
- https://docs.whop.com/api-reference/memberships/membership-activated
- https://docs.whop.com/developer/guides/memberships
- https://docs.whop.com/api-reference/shipments/create-shipment
- https://docs.whop.com/api-reference/shipments/list-shipments
- https://docs.whop.com/api-reference/checkout-configurations/create-checkout-configuration
- https://docs.whop.com/api-reference/checkout-configurations/list-checkout-configurations
- https://docs.whop.com/api-reference/entries/retrieve-entry
- https://docs.whop.com/developer/guides/accept-payments
- https://docs.whop.com/developer/guides/example-integration
- https://docs.whop.com/developer/guides/save-payment-methods
- https://docs.whop.com/payments/checkout-embed
- https://docs.whop.com/elements/latest/checkout/overview
- https://docs.whop.com/elements/latest/payments/overview
- https://docs.whop.com/payments/one-click-checkout-button
- https://docs.whop.com/supported-business-models/dtc-ecommerce
- https://docs.whop.com/developer/guides/app-views
- https://docs.whop.com/developer/guides/iframe
- https://docs.whop.com/developer/guides/authentication
- https://docs.whop.com/developer/guides/dev-proxy
- https://docs.whop.com/developer/guides/react-native
- https://docs.whop.com/api-reference/users/check-access
- https://docs.whop.com/api-reference/apps/list-apps
- https://docs.whop.com/api-reference/beta/cards/create-card
- https://dev.whop.com/apps/inapp-purchases
- https://www.npmjs.com/package/@whop/sdk
- https://www.npmjs.com/package/@whop/iframe
- https://www.npmjs.com/package/@whop/react
- https://github.com/whopio/whop-nextjs-app-template
- https://github.com/whopio/whop-examples/blob/main/web/apps/titled-tuesday/README.md
- https://whop.com/blog/whop-sandbox/ (Whop blog)
- https://whop.com/blog/integrate-checkout-api/ (Whop blog)
- https://whop.com/blog/add-checkout-to-nextjs-app/ (Whop blog)
- https://whop.com/blog/best-payment-apis/ (Whop blog, idempotency 24h claim)
- https://x.com/whop/status/2105729367301353844 (Whop ecommerce stores announcement)
- https://pinggy.io/blog/test_whop_webhooks_locally/ (third-party)
- https://github.com/LucaLyon1/writinggym/pull/8 and /pull/15 (third-party)
- https://github.com/OMWHMEDE/BLOCK27/pull/87 (third-party)
- https://deepwiki.com/whopio/whopsdk-typescript (third-party, possibly outdated)
- https://shopiator.com/blog/whop-ecommerce-stores-vs-shopify (third-party)
- https://adsx.com/blog/whop-ecommerce-launch-2026 (third-party, affiliate)
- https://adsx.com/blog/how-to-sell-physical-products-on-whop (third-party)