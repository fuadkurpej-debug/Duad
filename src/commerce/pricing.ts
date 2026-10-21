import { products } from "@/data/products";
import type { Locale } from "@/i18n/config";
import type { CartLine, PricedLine } from "./types";

const MAX_QTY = 20;

/**
 * Re-price a cart on the server from the catalogue. Client-supplied prices are
 * never trusted. Unknown products/options are dropped.
 */
export function priceCart(lines: CartLine[], locale: Locale): { lines: PricedLine[]; subtotal: number } {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) continue;
    if (product.variants) {
      if (!line.optionId || !product.variants.options.some((o) => o.id === line.optionId)) continue;
    } else if (line.optionId) {
      continue;
    }
    const quantity = Math.min(MAX_QTY, Math.max(1, Math.floor(line.quantity)));
    const option = product.variants?.options.find((o) => o.id === line.optionId);
    priced.push({
      ...line,
      quantity,
      unitPrice: product.price,
      lineTotal: Math.round(product.price * quantity * 100) / 100,
      name: option ? `${product.name[locale]} — ${option.label[locale]}` : product.name[locale],
    });
  }
  const subtotal = Math.round(priced.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  return { lines: priced, subtotal };
}
