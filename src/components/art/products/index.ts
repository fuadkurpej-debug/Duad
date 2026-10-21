import type { ArtComponent } from "../types";
import { kitchenDiningArt } from "./kitchen-dining";
import { homeOrganizationArt } from "./home-organization";
import { bathroomEssentialsArt } from "./bathroom-essentials";
import { livingDecorArt } from "./living-decor";
import { bedroomComfortArt } from "./bedroom-comfort";
import { smartHomeArt } from "./smart-home";
import { cleaningCareArt } from "./cleaning-care";

/** Registry of every product illustration, keyed by Product.art.kind. */
export const productArt: Record<string, ArtComponent> = {
  ...kitchenDiningArt,
  ...homeOrganizationArt,
  ...bathroomEssentialsArt,
  ...livingDecorArt,
  ...bedroomComfortArt,
  ...smartHomeArt,
  ...cleaningCareArt,
};
