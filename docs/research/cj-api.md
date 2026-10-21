# CJdropshipping Open API v2: research brief for automated fulfillment (as of 2026-10-21)

## How this was verified

- I could not fetch `developers.cjdropshipping.com` or `.cn` directly from this environment. Verification came from two places:
  1. WebSearch summaries of the official CJ developer pages.
  2. GitHub code search over word-for-word saved copies of official CJ doc pages that other developers committed to public repos (for example `zonggonau/bangparjo/docs/*.html`, `acdc-digital/elvato/.docs/supplier/*`, `VuongDuc12/AI_Dropship_Copilot/docs/cjdropshipapidocs/*`). These copies may be out of date, and I don't know exactly when they were saved.
- Labels used below:
  - **CONFIRMED**: seen in official CJ doc text, either through a search summary of the official URL or a word-for-word saved copy of that page.
  - **CORROBORATED**: not seen in official text, but several independent third-party integrations agree.
  - **UNVERIFIED**: one source only, conflicting sources, or inferred.
- The docs exist on two mirrors, `developers.cjdropshipping.com` and `developers.cjdropshipping.cn`. All official curl examples call the `.com` host.

---

## 1. Authentication

**Base URL**
- `https://developers.cjdropshipping.com/api2.0/v1/` — **CONFIRMED**. Every official curl example uses this prefix.
- Auth header on all calls: `CJ-Access-Token: <accessToken>` — **CONFIRMED**.

**Endpoints**

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/api2.0/v1/authentication/getAccessToken` | POST | **CONFIRMED** | JSON body `{"apiKey": "CJUserNum@api@xxxxxxxx"}` |
| `/api2.0/v1/authentication/refreshAccessToken` | POST | **CONFIRMED** | Body `{"refreshToken": "<string, len 80>"}` |
| Logout ("1.3 Logout Token (POST)") | POST | Section **CONFIRMED**, path **UNVERIFIED** | Probably `/api2.0/v1/authentication/logout`, but I didn't see the path |

**Email vs API key**
- The current docs say to use `apiKey`. A saved copy of the doc text reads: "Legacy integrations are still compatible with email + password … but new integrations should use apiKey only." — **CONFIRMED (saved copy)**.
- One live integration reports that email/password login is rejected for accounts in "apiKey mode" — **UNVERIFIED**.
- Plan: send only `apiKey`. Do not use an email + key pair.

**Getting the API key**
- The official docs describe a "Get API Key" page: install the API app, add an entry of type "API Key".
- Third-party guides give the menu path as My CJ → Authorization → API → API Key → Generate. The menu labels differ between guides — **UNVERIFIED**.

**Response fields**
- `openId`, `accessToken`, `accessTokenExpiryDate`, `refreshToken`, `refreshTokenExpiryDate`, `createDate` — **CONFIRMED**.
- You need `openId` later to verify webhook signatures.

**Token lifetime and limits**
- Current doc text: "the life of an access-token is 180 days, and the life of a refresh-token is 180 days" — **CONFIRMED** (official auth page summary plus a saved copy).
  - One search summary and older third-party designs give 15 days for the access token. Treat that as outdated.
  - Plan: refresh based on the returned `accessTokenExpiryDate`, not a hard-coded number.
- Server-side caching: repeated getAccessToken or refresh calls within 24 hours return the same tokens. A new token is issued after 24 hours or after a logout — **CONFIRMED**.
- getAccessToken is limited to 1 call per second (QPS = 1) — **CONFIRMED (saved copy)**.
  - A claim that it can only be called "once every 5 minutes" appeared in one search summary only — **UNVERIFIED**, probably outdated.
- Recommended pattern from CJ's "Get Access-token" guide: store both tokens, check expiry before each use, and refresh when the token is near expiry — **CONFIRMED**.

**Other**
- `GET /api2.0/v1/setting/get` — **CONFIRMED**. Returns the account profile, API quota limits, QPS limits and sandbox-account info. Useful as a health check at startup.

---

## 2. Products, inventory and freight

### Product endpoints

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/api2.0/v1/product/list` | GET | **CONFIRMED** (official interface table) | List products |
| `/api2.0/v1/product/listV2` | GET | **CORROBORATED** | Used by several integrations, which describe it as the main keyword search/list call (Elasticsearch-based). I didn't see it in an official summary. |
| `/api2.0/v1/product/query` | GET | **CONFIRMED** | Product detail. Exact query parameters (pid / productSku / variantSku) are **UNVERIFIED**. |
| `/api2.0/v1/product/variant/query` | GET | **CONFIRMED** | "Get Variants by PID / SKU" |
| `/api2.0/v1/product/variant/queryByVid` | GET | **CONFIRMED** | `vid` required. Optional `features=enable_inventory` also returns variant inventory, including storage id. |
| `/api2.0/v1/product/stock/queryByVid` | GET | **CONFIRMED** | "Get Stock" per variant |
| `/api2.0/v1/warehouse/detail` | GET | **CONFIRMED** (interface table) | Warehouse information |
| `/api2.0/v1/product/queryProductsByImage` | POST | **CONFIRMED** | Only whitelisted users can call it. Not needed here. |

- Response envelope: `{code, result, message, data, requestId}` — **CONFIRMED**.
- Plan: store the CJ `pid` and `vid` on every SKU in your catalog. Orders and freight quotes are keyed by `vid`.

### Freight calculation

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/api2.0/v1/logistic/freightCalculate` | POST | **CONFIRMED** | See fields below. The docs call it the simple mode. |
| `/api2.0/v1/logistic/freightCalculateTip` | Path **CONFIRMED**, method **UNVERIFIED** | | The docs say it gives more accurate estimates |
| `/api2.0/v1/logistic/unavailableShippingMethods` | | **UNVERIFIED** | Mentioned in one third-party GitHub issue only |

freightCalculate request fields:
- Required: `startCountryCode`, `endCountryCode`, `products: [{vid, quantity}]` — **CONFIRMED**.
- Optional: `zip`, `taxId`, `houseNumber`, `iossNumber`, `storageIdList`, `shippingMode` (1 = platform logistics, which then requires `platforms`; 2 = merchant logistics) — **CONFIRMED**.

freightCalculate response:
- Fields such as `logisticName`, `logisticPrice`, `logisticAging`, `totalPostageFee` come from third-party code only — **CORROBORATED/UNVERIFIED**.
- A third-party report says freightCalculateTip can return `result: true` with an empty array for some destinations. Treat an empty list as "no route" — **UNVERIFIED**.

---

## 3. Orders and payment

### Create order

`POST /api2.0/v1/shopping/order/createOrderV2` — **CONFIRMED**

**Headers**
- `CJ-Access-Token`, `Content-Type: application/json` — **CONFIRMED**.
- `platformToken` also appears in the official curl example. A saved doc note (dated 2025-01-08) says it is obtained the same way as the access token and "can be empty" if not required — **CONFIRMED (saved copy)**.

**`payType`** — **CONFIRMED**
- `1` or omitted: page payment. The response includes `cjPayUrl`, which needs manual payment.
- `2`: pay from CJ balance.
- `3`: create the order only; pay later.

**`isSandbox`** — **CONFIRMED**
- `0` (default) is a normal order; `1` is a sandbox order.

**Required fields** — **CORROBORATED**. Several independent integrations cite the official table; I didn't see the official required-column table myself.
- `orderNumber` (your own ID; makes retries idempotent)
- `shippingCountryCode` and `shippingCountry`
- `shippingProvince`, `shippingCity`, `shippingCustomerName`, `shippingAddress`
- `logisticName` (for example "CJPacket Ordinary" or "PostNL", as in official samples)
- `fromCountryCode` (warehouse country, for example "CN")
- `products: [{vid, quantity}]`

**Other fields in the official example** (required/optional status **UNVERIFIED**)
- `shippingZip`, `shippingPhone`, `shippingAddress2`, `remark`, `products[].storeLineItemId`
- Plan: always send phone and ZIP for Balkan addresses.

**Unverified behaviour**
- Duplicate `orderNumber` is rejected with error code `1603003` — one third-party source only — **UNVERIFIED**.
- `logisticName` accepts a comma-separated priority list (Konnektive docs) — **UNVERIFIED**.
- Using `sku` instead of `vid` (one integration) — **UNVERIFIED**.

### Other order and payment endpoints

| Endpoint | Method | Status |
|---|---|---|
| `/api2.0/v1/shopping/order/createOrder` (V1) | POST | **CONFIRMED** listed; V2 is preferred |
| `/api2.0/v1/shopping/order/confirmOrder` | PATCH | Path and method **CONFIRMED** (official curl copy). Body `{orderId}` **UNVERIFIED**. |
| `/api2.0/v1/shopping/order/getOrderDetail?orderId=` | GET | **CONFIRMED** |
| `/api2.0/v1/shopping/order/list` | GET | **CORROBORATED** |
| `/api2.0/v1/shopping/order/deleteOrder` | method unclear | **UNVERIFIED** |
| `/api2.0/v1/shopping/pay/getBalance` | GET | **CONFIRMED** (interface table) |
| `/api2.0/v1/shopping/pay/payBalance` | POST | Path **CONFIRMED**. Body `{"orderId": "..."}` **CORROBORATED**. |
| `/api2.0/v1/shopping/pay/payBalanceV2` | POST | Path **CONFIRMED**. Saved official table lists `shipmentOrderId` and `payId`, both required. Where those two values come from is **UNVERIFIED** (one repo mentions a "createOrderV3", also **UNVERIFIED**). |

**Recommended automated flow**
1. Your payment provider confirms payment.
2. Get a freight quote: `freightCalculate` → pick `logisticName`.
3. Create the order: `createOrderV2` with `payType=2` and an idempotent `orderNumber`.
4. Fallback if balance payment isn't immediate: `payType=3`, then `confirmOrder` (PATCH), then `payBalance` with `{orderId}`. This sequence is **CORROBORATED**, not official.
5. Poll `getOrderDetail` and/or listen to webhooks.

### Order status lifecycle

- Values: `CREATED`, `IN_CART`, `UNPAID`, `UNSHIPPED`, `SHIPPED`, `DELIVERED`, `CANCELLED` — **CONFIRMED** (Interface Field Definition page, saved copy).
- Shipping info can only be updated while the order is `UNSHIPPED` — **CONFIRMED** (Orders Synchronization Processing page).
- Numeric codes used by sandbox endpoints (100 = CREATED, 200 = UNPAID, 300 = paid, then 400→700) — partly from official summaries, partly third-party. The mapping of 400–700 to names is **UNVERIFIED**.
- The CJ dashboard uses different labels (Awaiting Payment, Pending, Processing, Dispatched, Completed, Closed). Don't map these to the API enum without testing.

---

## 4. Tracking and webhooks

### Tracking

- `GET /api2.0/v1/logistic/trackInfo?trackNumber=...` — **CONFIRMED** (current).
  - `trackNumber` is required and can be repeated for batch queries. The docs list length "200"; it's ambiguous whether that means characters or count.
  - I didn't see the response schema.
- `GET /api2.0/v1/logistic/getTrackInfo` — **CONFIRMED** but marked **Deprecated**.
- `getOrderDetail` also returns tracking fields (`trackNumber`, `trackingProvider`) — **CORROBORATED**.

### Webhooks

`POST /api2.0/v1/webhook/set` — **CONFIRMED**

**Body**
- Four topics, `product`, `stock`, `order` and `logistics`, each with a type and a list of callback URLs — **CONFIRMED**.
- Shape `{"type": "ENABLE" | "CANCEL", "callbackUrls": ["https://..."]}` — **CORROBORATED**.
- A third-party library says any topic you leave out is treated as CANCEL — **UNVERIFIED**. Plan: always send all four topics.

**Receiver requirements** — **CONFIRMED**
- Public HTTPS only; localhost and 127.0.0.1 are rejected. TLS 1.2 or 1.3. CJ sends POST with `application/json`.
- Return `200 OK` within **3 seconds**.
- Failed pushes are retried up to 3 times. Continuous failures trigger auto-close of the topic.
- Third-party reports put the auto-close threshold at "2 hours below 80% success" — **UNVERIFIED**.

**Signature** — **CONFIRMED** (official webhook page summary)
- Header `sign` = Base64(HMAC-SHA256(key = `openId` as a string, message = raw request body)).
- Hash the raw bytes. Do not re-serialize the parsed JSON.
- There is no timestamp or replay protection documented. Add your own deduplication by message ID.

**Logistics message payload**
- `logisticName`, `trackingNumber`, `trackingStatus` (numeric) — **CONFIRMED (saved sample)**.
- `orderId`, `storeOrderNumbers[]`, `trackingProvider`, `trackingUrl` — **CORROBORATED**.

**Stock webhook**
- One report says stock is only pushed for products you subscribed to individually — **UNVERIFIED**.

**Plan:** acknowledge the webhook immediately, queue it, and process asynchronously. Keep a scheduled job that polls `getOrderDetail` / `trackInfo` as a backup in case CJ auto-closes a topic.

---

## 5. Rate limits, sandbox, costs and Balkan shipping

### Rate limits — **CONFIRMED** (Interface Call Restrictions page)

| CJ level | Requests per second |
|---|---|
| Free / sales level 0–1 | 1 |
| Plus / level 2 | 2 |
| Prime / level 3 | 4 |
| Advanced / level 4–5 | 6 |

- Also 10 requests/second per IP, and 30 requests/second for non-login interfaces.
- CJ says it may adjust these defaults.
- The old daily call cap is replaced by a points-based daily quota ("API Points Resource Rules"). I couldn't retrieve the point costs — **UNVERIFIED**.
- Error `1600200` "Too Many Requests, QPS limit is 1 time/1second" is seen in live logs, including in CJ's own `CJ-dropshipping/api-mcp` repo — **CORROBORATED**.
- Error `1600201` for exhausted points — **UNVERIFIED**.
- Plan: put all CJ calls behind one shared rate limiter (1 request/second on the Free tier).

### Sandbox — **CONFIRMED**

- "CJ sandbox account is a test account under production environment." There is a production account and a separate sandbox account, on the same base URL.
- An order created with `isSandbox=1`:
  - uses simulated payment and does not deduct real balance;
  - creates no real logistics or fulfilment;
  - comes back with an `isSandbox` field in order queries.
- Sandbox helper endpoints: `/shopping/sandbox/simulatePay`, `/shopping/sandbox/updateStatus` (must go 300→400→500→600→700 in order, no skipping or going back), `/shopping/sandbox/updateTrackNumber` — names **CONFIRMED**. The full `/api2.0/v1/` prefix is inferred.
- A third-party report says simulatePay rejects orders still in CREATED (100), so the order must reach UNPAID (200) first — **UNVERIFIED**.

### Costs

- I found no CJ statement of any API fee. The docs give Free accounts a 1 request/second limit, which suggests API access works on the Free tier. That a Free account can use the API at no cost is **UNVERIFIED**, but likely.
- Membership tiers, per third-party reviews (not an official price page): Plus about $15.99/month, Prime $19.99/month, Advanced $59.99/month — **UNVERIFIED**. The API-relevant benefit is the higher request rate.
- Per-order costs are product cost plus shipping, plus optional fees (branding, storage).

### Shipping to Serbia (RS), Montenegro (ME), Bosnia and Herzegovina (BA) — UNKNOWN

- Serbia ("RS") is in CJ's API country-code appendix — **CONFIRMED**. That does not mean any shipping line serves it.
- I found no CJ source on CJPacket or other line coverage or transit times for RS, ME or BA. Europe-wide CJPacket estimates (about 8–16 days) don't name Balkan countries.
- **Required test before launch:** call `freightCalculate` with `endCountryCode` RS, ME and BA, for representative `vid`s and each likely `fromCountryCode` (CN plus any EU warehouse). See which lines come back and at what price.
- Customs: all three countries are outside the EU, so IOSS (an EU scheme) does not apply. Even shipments from a CJ EU warehouse will clear customs.
  - Serbian blogs give conflicting duty/VAT thresholds (€50 vs €70, 20% VAT) — **UNVERIFIED**. Check with Uprava carina.
  - Customers paying duty on delivery leads to refused parcels.

---

## 6. Practical risks

### Payment must be made separately on the CJ side

- Money your payment provider collects from customers cannot be passed through to CJ. CJ is paid only from your CJ wallet (`payType=2`) or through a hosted payment page (`payType=1`, which returns `cjPayUrl` and needs a human).
- Full automation means keeping a prefunded wallet balance.
  - Monitor it with `getBalance` and alert at a threshold. Orders stay `UNPAID` if the balance runs out.
  - A third-party integration guide confirms orders must then be paid manually.
- Wallet top-up methods, from an undated CJ blog (**UNVERIFIED** as current): Payoneer (recommended, up to 2% bonus), wire transfer, credit card (contact CJ), and PayPal through an agent-provided bank account.
- CJ prices are in USD; selling in RSD/EUR adds currency risk.

### Returns and disputes

- API endpoints — **CONFIRMED**:
  - `GET /api2.0/v1/disputes/disputeProducts?orderId=` lists the line items you can dispute.
  - `POST /api2.0/v1/disputes/disputeConfirmInfo` takes `orderId` and `productInfoList`.
  - I found no separate "create dispute" call.
- CJ policy:
  - All disputes must be opened on CJ, or the account may be blocked.
  - Damaged items get a refund or resend if you supply photo/video evidence. Missing parts are resent, not refunded.
  - No disputes for subjective reasons. No cover for wrong addresses. No refund if tracking shows "delivered".
  - Returns go only to CJ's China warehouse, and CJ advises against them; the usual practice is to refund and let the customer keep the item.
  - Dispute deadlines differ between sources — **UNVERIFIED**.
- Not researched here: Serbian consumer law gives a statutory withdrawal right for distance sales, which you would carry yourself, not CJ. Confirm with local counsel.

### Using CJ product images

- CJ's User Agreement says platform content, including images, belongs to CJ or its content suppliers. If a rights holder complains, CJ removes the content but accepts no liability.
- I found no explicit licence letting sellers reuse catalogue images. Importing them is common practice through CJ's own store apps, but that is implied, not stated — **UNVERIFIED**.
- CJ sells a photo/video shoot service with a "copyright" option (permanent use, private to you) and a "no copyright" option (public, others can buy it).
- Recommendation:
  - Get written confirmation from CJ or your agent before using their images.
  - Avoid watermarked or branded images.
  - For hero and brand images, use CJ's copyright photo option or your own photos.

### Other engineering risks

- **Token lifetime:** sources conflict (180 vs 15 days). Use the expiry dates returned in the response.
- **Rate limit:** the 1 request/second Free-tier limit needs a central queue. Bulk catalogue sync must be throttled.
- **Webhooks:** the 3-second timeout and auto-close behaviour make a polling backup mandatory.
- **Address format (my recommendation, not a CJ rule):** collect addresses in Latin script; transliterate from Serbian Cyrillic. Serbian addresses may also need a sensible value for the required `shippingProvince` field (for example, a district or the city).
- **Idempotency:** use a deterministic `orderNumber` for each of your orders.
- **Official MCP server:** CJ publishes one (`cjdropshipping.com/ai/claude`, GitHub `CJ-dropshipping/api-mcp`), useful for exploration but not needed for the integration.

---

## Sources

**Official CJ documentation and pages**
- https://developers.cjdropshipping.com/en/api/api2/ (API V2.0 interface list)
- https://developers.cjdropshipping.cn/en/api/api2/
- https://developers.cjdropshipping.com/en/api/api2/api/auth.html
- https://developers.cjdropshipping.cn/en/api/api2/api/auth.html
- https://developers.cjdropshipping.cn/en/api/start/token.html
- https://developers.cjdropshipping.cn/en/api/api2/api/product.html
- https://developers.cjdropshipping.com/en/api/api2/api/logistic.html
- https://developers.cjdropshipping.cn/en/api/api2/api/logistic.html
- https://developers.cjdropshipping.com/en/api/api2/api/shopping.html
- https://developers.cjdropshipping.cn/en/api/api2/api/shopping.html
- https://developers.cjdropshipping.com/en/api/api2/api/webhook.html
- https://developers.cjdropshipping.com/en/api/start/webhook.html
- https://developers.cjdropshipping.cn/en/api/start/sandbox.html
- https://developers.cjdropshipping.com/en/api/api2/standard/limit.html
- https://developers.cjdropshipping.cn/en/api/start/limit.html
- https://developers.cjdropshipping.com/en/api/api2/api/dispute.html
- https://developers.cjdropshipping.cn/en/api/start/development.html
- https://developers.cjdropshipping.cn/en/api/start/utils.html
- https://developers.cjdropshipping.cn/en/api/start/Products-Synchronization-Processing.html
- https://developers.cjdropshipping.com/en/api/api2/standard/field.html (order status enum; path taken from the docs sidebar in a saved copy)
- https://cjdropshipping.com/dispute-policy.html
- https://blog.cjdropshipping.com/detail/1331550742535688194
- https://blog.cjdropshipping.com/detail/how-to-deal-with-returns/
- https://cjdropshipping.com/user-agreement
- https://blog.cjdropshipping.com/detail/how-to-use-video-shooting-service-from-cj-dropshipping
- https://blog.cjdropshipping.cn/detail/payment-methods
- https://cjdropshipping.com/ai/claude
- https://github.com/CJ-dropshipping/api-mcp

**Saved copies of official docs (third-party repos, used for word-for-word checks)**
- https://github.com/zonggonau/bangparjo (`/docs`: Authentication, Settings, Product, Logistics, Webhook Mechanism, Sandbox, Interface Field Definitions, Country Code)
- https://github.com/acdc-digital/elvato (`/.docs/supplier`: CJ API Docs 006/014/017/018)
- https://github.com/VuongDuc12/AI_Dropship_Copilot (`/docs/cjdropshipapidocs`)
- https://github.com/mouhssine0/flatter (`db.txt`)

**Third-party integrations and reports (CORROBORATED / UNVERIFIED claims)**
- https://github.com/magnetoid/Morpheus (`plugins/installed/cjdropshipping`)
- https://github.com/zaindroid/trackzy
- https://github.com/huawolf/VaneWorker (`skills/cj-dropshipping-api`)
- https://github.com/shunai394-hash/tracer/pull/14
- https://github.com/shunai394-hash/tracer/pull/865
- https://github.com/shunai394-hash/tracer/issues/1375
- https://github.com/AndriyKostenko/React-FastAPI_E-Commerce_App/pull/18
- https://github.com/AndriyKostenko/React-FastAPI_E-Commerce_App/pull/39
- https://github.com/nicolasojeda26/ShopyDashboard/pull/1
- https://packagist.org/packages/thayron/cjdropshipping-php
- https://help.konnektive.com/konnektive-crm/admin-setup/plugins/fulfillment-houses/cj-dropshipping
- https://help.storeep.com/en/shipping-and-fulfillment/cjdropshipping
- https://webkul.com/blog/magento-2-cj-dropshipping-documentation/
- https://revenuegeeks.com/software/cjdropshipping
- https://www.spocket.co/blogs/cjdropshipping-overview
- https://reload.rs/blog/dropshipping-u-srbiji/