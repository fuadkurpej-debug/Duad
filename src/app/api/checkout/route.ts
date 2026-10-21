import { NextResponse } from "next/server";
import { commerceConfig } from "@/commerce/config";
import { priceCart } from "@/commerce/pricing";
import type { CartLine } from "@/commerce/types";
import { isLocale } from "@/i18n/config";

/**
 * POST /api/checkout — integration boundary for creating a payment checkout.
 *
 * While PAYMENTS_ENABLED !== "true" this always answers 503 and does nothing.
 * When enabled it re-prices the cart server-side; creating the actual Whop
 * checkout is still unimplemented (see src/commerce/payments/whop.ts), so it
 * answers 501. No order is stored and no payment is created in either case.
 */
export async function POST(request: Request) {
  if (!commerceConfig.paymentsEnabled) {
    return NextResponse.json(
      { error: "payments_disabled", message: "Ordering is not open yet. No payment was taken." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { lines, locale } = (body ?? {}) as { lines?: CartLine[]; locale?: string };
  if (!Array.isArray(lines) || !isLocale(locale)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const priced = priceCart(lines, locale);
  if (priced.lines.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  return NextResponse.json(
    {
      error: "not_implemented",
      message: "Whop checkout creation is not implemented yet.",
      subtotal: priced.subtotal,
    },
    { status: 501 },
  );
}
