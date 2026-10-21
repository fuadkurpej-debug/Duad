import type { Product } from "../types";
import { kitchenDiningProducts } from "./kitchen-dining";
import { homeOrganizationProducts } from "./home-organization";
import { bathroomEssentialsProducts } from "./bathroom-essentials";
import { livingDecorProducts } from "./living-decor";
import { bedroomComfortProducts } from "./bedroom-comfort";
import { smartHomeProducts } from "./smart-home";
import { cleaningCareProducts } from "./cleaning-care";

export const products: Product[] = [
  ...kitchenDiningProducts,
  ...homeOrganizationProducts,
  ...bathroomEssentialsProducts,
  ...livingDecorProducts,
  ...bedroomComfortProducts,
  ...smartHomeProducts,
  ...cleaningCareProducts,
];

const byId = new Map(products.map((p) => [p.id, p]));

export function getProduct(id: string): Product | undefined {
  return byId.get(id);
}

export function productsInCategory(categoryId: Product["category"]): Product[] {
  return products.filter((p) => p.category === categoryId);
}
