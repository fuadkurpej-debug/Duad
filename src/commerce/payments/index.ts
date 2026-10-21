import { commerceConfig } from "../config";
import { PaymentsDisabledError, type PaymentProvider } from "./provider";
import { WhopPaymentProvider } from "./whop";

/** Returns the active payment provider, or throws while payments are disabled. */
export function getPaymentProvider(): PaymentProvider {
  if (!commerceConfig.paymentsEnabled) throw new PaymentsDisabledError();
  return new WhopPaymentProvider();
}

export * from "./provider";
