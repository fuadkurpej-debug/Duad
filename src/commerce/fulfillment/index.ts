import { commerceConfig } from "../config";
import { CjDropshippingProvider } from "./cjdropshipping";
import { FulfillmentDisabledError, type FulfillmentProvider } from "./provider";

export function getFulfillmentProvider(): FulfillmentProvider {
  if (!commerceConfig.fulfillmentEnabled) throw new FulfillmentDisabledError();
  return new CjDropshippingProvider();
}

export * from "./provider";
