import type { FulfillmentProvider, SupplierOrderResult, TrackingInfo } from "./provider";
import type { Order } from "../types";

/**
 * CJdropshipping provider — NOT IMPLEMENTED (intentionally).
 *
 * Planned approach (verify endpoints against CJ's current API docs; see
 * docs/FULFILLMENT_PLAN.md):
 *  - authenticate with CJ_API_EMAIL / CJ_API_KEY to obtain an access token
 *  - map each order line to a CJ variant id via Product.supplier.variantIds
 *  - create the supplier order with the customer's shipping address
 *  - poll or receive webhooks for tracking numbers
 * No real supplier orders may be created until this is reviewed and tested.
 */
export class CjDropshippingProvider implements FulfillmentProvider {
  readonly name = "cjdropshipping";

  async createSupplierOrder(_order: Order): Promise<SupplierOrderResult> {
    throw new Error("CjDropshippingProvider.createSupplierOrder is not implemented yet.");
  }

  async getTracking(_supplierOrderId: string): Promise<TrackingInfo[]> {
    throw new Error("CjDropshippingProvider.getTracking is not implemented yet.");
  }
}
