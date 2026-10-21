import { NextResponse } from "next/server";
import { commerceConfig } from "@/commerce/config";

/**
 * POST /api/webhooks/whop — will receive Whop payment webhooks.
 *
 * Planned flow (docs/WHOP_INTEGRATION_PLAN.md):
 *   raw body -> verify signature (WHOP_WEBHOOK_SECRET) -> payment.succeeded
 *   -> mark order paid (idempotently) -> enqueue supplier order (CJ)
 *   -> respond 2xx quickly.
 * Not implemented: responds 503 while payments are disabled, otherwise 501.
 */
export async function POST() {
  if (!commerceConfig.paymentsEnabled) {
    return NextResponse.json({ error: "payments_disabled" }, { status: 503 });
  }
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
