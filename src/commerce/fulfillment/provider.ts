import type { Order } from "../types";

/**
 * Fulfilment boundary. Called only from the server after a VERIFIED payment
 * webhook, never from the browser.
 */
export interface SupplierOrderResult {
  supplierOrderId: string;
  status: "created" | "awaiting_supplier_payment" | "rejected";
  message?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier?: string;
  status?: string;
  url?: string;
}

export interface FulfillmentProvider {
  readonly name: string;
  createSupplierOrder(order: Order): Promise<SupplierOrderResult>;
  getTracking(supplierOrderId: string): Promise<TrackingInfo[]>;
}

export class FulfillmentDisabledError extends Error {
  constructor() {
    super("Fulfilment is disabled (FULFILLMENT_ENABLED is not 'true').");
    this.name = "FulfillmentDisabledError";
  }
}
