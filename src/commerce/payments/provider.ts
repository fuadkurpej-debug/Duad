import type { Order } from "../types";

/**
 * Payment boundary. The storefront only talks to this interface, so the
 * provider (Whop today, anything else later) can change without touching UI.
 */
export interface CheckoutSession {
  /** URL to redirect the customer to (hosted checkout), if the provider uses redirects. */
  redirectUrl?: string;
  /** Provider-side id used to reconcile the webhook with our order. */
  providerReference: string;
}

export interface PaymentProvider {
  readonly name: string;
  /** Create a checkout for an already priced, server-validated order. */
  createCheckout(order: Order, opts: { successUrl: string; cancelUrl: string }): Promise<CheckoutSession>;
  /** Verify and parse an incoming webhook. Must use the RAW request body. */
  parseWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent>;
}

export type PaymentEvent =
  | { type: "payment.succeeded"; orderId: string; providerPaymentId: string }
  | { type: "payment.failed"; orderId: string; providerPaymentId: string }
  | { type: "refund.created"; orderId: string; providerPaymentId: string; amount?: number }
  | { type: "ignored"; reason: string };

export class PaymentsDisabledError extends Error {
  constructor() {
    super("Payments are disabled (PAYMENTS_ENABLED is not 'true').");
    this.name = "PaymentsDisabledError";
  }
}
