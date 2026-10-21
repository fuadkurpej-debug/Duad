"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useI18n } from "@/components/I18nProvider";
import { BagIcon, ChevronDownIcon, MenuIcon, SearchIcon } from "@/components/ui/Icons";
import { categories } from "@/data/categories";
import { href } from "@/lib/routes";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const { locale, t } = useI18n();
  const cart = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const collectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setCollectionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!collectionsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!collectionsRef.current?.contains(e.target as Node)) setCollectionsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCollectionsOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [collectionsOpen]);

  const navLink =
    "relative inline-flex min-h-11 items-center text-[0.86rem] font-medium tracking-[0.02em] text-charcoal/85 transition-colors hover:text-charcoal";

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled
            ? "border-line bg-ivory/92 shadow-[0_8px_30px_-20px_rgba(43,41,38,0.25)] backdrop-blur-md"
            : "border-transparent bg-ivory"
        }`}
      >
        <div className="container-page flex h-[4.25rem] items-center gap-4 md:h-[4.75rem]">
          <button
            type="button"
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-charcoal lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <MenuIcon size={22} />
          </button>

          <Link href={href(locale, { key: "home" })} className="shrink-0" aria-label={`Kutak Home — ${t.nav.home}`}>
            <Logo />
          </Link>

          <nav aria-label={t.nav.primary} className="ml-10 hidden flex-1 lg:block">
            <ul className="flex items-center gap-8">
              <li>
                <Link href={href(locale, { key: "shop" })} className={navLink}>
                  {t.nav.shopAll}
                </Link>
              </li>
              <li>
                <div ref={collectionsRef} className="relative">
                  <button
                    type="button"
                    className={`${navLink} gap-1`}
                    aria-expanded={collectionsOpen}
                    aria-controls="collections-panel"
                    onClick={() => setCollectionsOpen((v) => !v)}
                  >
                    {t.nav.collections}
                    <ChevronDownIcon size={16} className={`transition-transform ${collectionsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {collectionsOpen && (
                    <div
                      id="collections-panel"
                      className="absolute top-full left-1/2 mt-3 w-[min(44rem,80vw)] -translate-x-1/2 animate-[fade-in_0.25s_ease] rounded-2xl border border-line bg-paper p-6 shadow-[0_30px_60px_-30px_rgba(43,41,38,0.35)]"
                    >
                      <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                        {categories.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={href(locale, { key: "category", categoryId: c.id })}
                              className="group block rounded-xl px-3 py-3 transition-colors hover:bg-linen/60"
                            >
                              <span className="block font-display text-[1.08rem] text-charcoal">{c.name[locale]}</span>
                              <span className="mt-0.5 block text-[0.8rem] leading-snug text-muted">{c.short[locale]}</span>
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={href(locale, { key: "shop" })}
                            className="flex h-full items-center rounded-xl px-3 py-3 text-sm font-semibold text-charcoal underline-offset-4 hover:underline"
                          >
                            {t.nav.allCollections} →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </li>
              <li>
                <Link href={href(locale, { key: "about" })} className={navLink}>
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href={href(locale, { key: "faq" })} className={navLink}>
                  {t.nav.faq}
                </Link>
              </li>
              <li>
                <Link href={href(locale, { key: "contact" })} className={navLink}>
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <Link
              href={href(locale, { key: "shop" }, { focus: "search" })}
              className="hidden h-11 w-11 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-linen/70 sm:inline-flex"
              aria-label={t.nav.search}
            >
              <SearchIcon size={21} />
            </Link>
            <button
              type="button"
              onClick={cart.openDrawer}
              className="relative -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-linen/70"
              aria-label={`${t.nav.openCart} (${cart.count})`}
              aria-haspopup="dialog"
              data-testid="cart-button"
            >
              <BagIcon size={22} />
              {cart.ready && cart.count > 0 && (
                <span
                  className="absolute top-1 right-0.5 inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-charcoal px-1 text-[0.62rem] font-bold text-paper tabular-nums"
                  data-testid="cart-count"
                >
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
