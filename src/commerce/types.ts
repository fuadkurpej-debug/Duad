import type { Locale } from "@/i18n/config";

/** One line in the visitor's cart, as stored in the browser. */
export interface CartLine {
  productId: string;
  /** Selected variant option id, or null for products without variants. */
  optionId: string | null;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2, e.g. "ME", "RS", "BA". */
  country: string;
  phone?: string;
}

/** A priced line, computed on the SERVER from the catalogue (never trust client prices). */
export interface PricedLine extends CartLine {
  unitPrice: number;
  lineTotal: number;
  name: string;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "sent_to_supplier"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/** Internal order record. Persistence (database) is not implemented yet. */
export interface Order {
  id: string;
  locale: Locale;
  email: string;
  lines: PricedLine[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  payment?: { provider: "whop"; checkoutId?: string; paymentId?: string };
  fulfillment?: { provider: "cjdropshipping"; supplierOrderId?: string; trackingNumbers?: string[] };
  createdAt: string;
}
