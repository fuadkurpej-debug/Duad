import type { CheckoutSession, PaymentEvent, PaymentProvider } from "./provider";
import type { Order } from "../types";

/**
 * Whop payment provider — NOT IMPLEMENTED (intentionally).
 *
 * Planned approach (verify against current Whop docs before building; see
 * docs/WHOP_INTEGRATION_PLAN.md):
 *  1. createCheckout(): call the Whop API with the server-side WHOP_API_KEY of
 *     the NEW business to create a checkout for the order total, attaching
 *     { orderId } as metadata, and return the hosted checkout URL.
 *  2. parseWebhook(): verify the Standard Webhooks signature with
 *     WHOP_WEBHOOK_SECRET using the raw body, then map `payment.succeeded`,
 *     `payment.failed` and refund events to PaymentEvent using the metadata.
 *
 * Until then every method throws, so nothing can be charged by accident.
 */
export class WhopPaymentProvider implements PaymentProvider {
  readonly name = "whop";

  async createCheckout(_order: Order, _opts: { successUrl: string; cancelUrl: string }): Promise<CheckoutSession> {
    throw new Error("WhopPaymentProvider.createCheckout is not implemented yet.");
  }

  async parseWebhook(_rawBody: string, _headers: Headers): Promise<PaymentEvent> {
    throw new Error("WhopPaymentProvider.parseWebhook is not implemented yet.");
  }
}
