"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/components/I18nProvider";
import { CloseIcon, InfoIcon } from "@/components/ui/Icons";
import { useDialog } from "@/components/ui/useDialog";
import { fmt } from "@/i18n/messages";
import { formatPrice } from "@/lib/format";
import { href } from "@/lib/routes";
import { CartLineRow } from "./CartLineRow";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { locale, t } = useI18n();
  const cart = useCart();
  const pathname = usePathname();
  const ref = useDialog<HTMLDivElement>(cart.drawerOpen, cart.closeDrawer);
  const { closeDrawer } = cart;

  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Polite live region for cart updates (always mounted). */}
      <div className="sr-only" aria-live="polite" role="status" data-testid="cart-live">
        {cart.announcement}
      </div>
      {cart.drawerOpen && (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            type="button"
            className="absolute inset-0 animate-[fade-in_0.3s_ease] bg-charcoal/35"
            aria-label={t.cart.close}
            tabIndex={-1}
            onClick={cart.closeDrawer}
          />
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[28rem] animate-[drawer-in_0.45s_var(--ease-soft)] flex-col bg-ivory shadow-2xl"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 id="cart-drawer-title" className="font-display text-[1.5rem]">
                {t.cart.title}
                {cart.count > 0 && (
                  <span className="ml-2 align-middle font-sans text-sm text-muted">
                    ({cart.count === 1 ? t.cart.itemCountOne : fmt(t.cart.itemCount, { count: cart.count })})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={cart.closeDrawer}
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-linen"
                aria-label={t.cart.close}
                data-autofocus
              >
                <CloseIcon size={22} />
              </button>
            </div>

            {cart.items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="font-display text-[1.4rem]">{t.cart.empty}</p>
                <p className="max-w-xs text-sm text-muted">{t.cart.emptyHint}</p>
                <Link href={href(locale, { key: "shop" })} className="btn btn-primary mt-2" onClick={cart.closeDrawer}>
                  {t.cart.continueShopping}
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  {cart.items.map((item) => (
                    <CartLineRow key={`${item.productId}:${item.optionId}`} item={item} compact onNavigate={cart.closeDrawer} />
                  ))}
                </ul>
                <div className="border-t border-line bg-paper px-6 pt-5 pb-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink">{t.cart.subtotal}</span>
                    <span className="text-lg font-semibold tabular-nums" data-testid="drawer-subtotal">
                      {formatPrice(cart.subtotal, locale)}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.8rem] text-muted">
                    {t.cart.shipping}: {t.cart.shippingCalculated}
                  </p>
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-linen/70 px-3 py-2.5 text-[0.8rem] leading-snug text-ink">
                    <InfoIcon size={16} className="mt-0.5 shrink-0" />
                    {t.cart.sampleNote}
                  </p>
                  <div className="mt-4 grid gap-2.5">
                    <Link href={href(locale, { key: "checkout" })} className="btn btn-primary w-full" onClick={cart.closeDrawer}>
                      {t.cart.checkout}
                    </Link>
                    <Link href={href(locale, { key: "cart" })} className="btn btn-secondary w-full" onClick={cart.closeDrawer}>
                      {t.cart.viewCart}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
