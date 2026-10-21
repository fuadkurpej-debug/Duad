/**
 * Feature flags for money-moving integrations. Both default to OFF and are
 * read on the server only. Turning them on is NOT enough by itself: the
 * provider implementations in ./payments and ./fulfillment still have to be
 * completed and tested (see docs/WHOP_INTEGRATION_PLAN.md).
 */
export const commerceConfig = {
  paymentsEnabled: process.env.PAYMENTS_ENABLED === "true",
  fulfillmentEnabled: process.env.FULFILLMENT_ENABLED === "true",
} as const;
