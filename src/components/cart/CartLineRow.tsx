"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { ProductArt } from "@/components/product/ProductArt";
import { fmt } from "@/i18n/messages";
import { formatPrice } from "@/lib/format";
import { href } from "@/lib/routes";
import { useCart, type CartItem } from "./CartProvider";
import { QuantityControl } from "./QuantityControl";

export function CartLineRow({ item, compact, onNavigate }: { item: CartItem; compact?: boolean; onNavigate?: () => void }) {
  const { locale, t } = useI18n();
  const cart = useCart();
  const name = item.product.name[locale];
  const url = href(locale, { key: "product", productId: item.product.id });

  return (
    <li className="flex gap-4 py-5" data-cart-line={`${item.productId}:${item.optionId ?? ""}`}>
      <Link
        href={url}
        onClick={onNavigate}
        className={`shrink-0 overflow-hidden rounded-xl bg-linen ${compact ? "w-20" : "w-24 sm:w-28"}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductArt
          kind={item.product.art.kind}
          tone={item.product.art.tone}
          accent={item.option?.swatch}
          uid={`line-${compact ? "d" : "p"}-${item.productId}-${item.optionId ?? "x"}`}
          className="aspect-[4/5] h-auto w-full"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={url} onClick={onNavigate} className="font-display text-[1.05rem] leading-snug text-charcoal hover:underline">
              {name}
            </Link>
            {item.option && item.product.variants && (
              <p className="mt-0.5 text-[0.82rem] text-muted">
                {item.product.variants.name[locale]}: {item.option.label[locale]}
              </p>
            )}
            <p className="mt-0.5 text-[0.82rem] text-muted tabular-nums">{formatPrice(item.product.price, locale)}</p>
          </div>
          <p className="shrink-0 text-[0.95rem] font-medium tabular-nums">{formatPrice(item.lineTotal, locale)}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <QuantityControl
            size="sm"
            value={item.quantity}
            onChange={(q) => {
              cart.setQuantity(item.productId, item.optionId, q);
              cart.announce(t.cart.updated);
            }}
            label={`${t.product.quantity}: ${name}`}
          />
          <button
            type="button"
            className="min-h-9 text-[0.8rem] font-medium text-muted underline underline-offset-4 hover:text-charcoal"
            onClick={() => {
              cart.remove(item.productId, item.optionId);
              cart.announce(fmt(t.cart.removed, { name }));
            }}
            aria-label={fmt(t.cart.removeItem, { name })}
          >
            {t.cart.remove}
          </button>
        </div>
      </div>
    </li>
  );
}
