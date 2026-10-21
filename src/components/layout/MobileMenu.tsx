"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";
import { useDialog } from "@/components/ui/useDialog";
import { categories } from "@/data/categories";
import { href } from "@/lib/routes";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useI18n();
  const ref = useDialog<HTMLDivElement>(open, onClose);
  if (!open) return null;

  const secondary = [
    { label: t.nav.about, ref: { key: "about" } as const },
    { label: t.nav.faq, ref: { key: "faq" } as const },
    { label: t.nav.contact, ref: { key: "contact" } as const },
    { label: t.footer.shipping, ref: { key: "shipping" } as const },
    { label: t.footer.tracking, ref: { key: "tracking" } as const },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 animate-[fade-in_0.3s_ease] bg-charcoal/35"
        aria-label={t.nav.closeMenu}
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={ref}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menu}
        className="absolute inset-y-0 left-0 flex w-[min(24rem,88vw)] animate-[menu-in_0.45s_var(--ease-soft)] flex-col overflow-y-auto bg-ivory"
      >
        <div className="flex h-[4.25rem] items-center justify-between border-b border-line px-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full"
            aria-label={t.nav.closeMenu}
            data-autofocus
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-8 px-5 py-6">
          <Link
            href={href(locale, { key: "shop" }, { focus: "search" })}
            onClick={onClose}
            className="flex min-h-12 items-center gap-3 rounded-full border border-line bg-paper px-4 text-sm text-muted"
          >
            <SearchIcon size={18} />
            {t.shop.searchPlaceholder}
          </Link>

          <div>
            <p className="eyebrow mb-3">{t.nav.collections}</p>
            <ul className="divide-y divide-line border-y border-line">
              <li>
                <Link
                  href={href(locale, { key: "shop" })}
                  onClick={onClose}
                  className="flex min-h-13 items-center py-3 font-display text-[1.3rem]"
                >
                  {t.nav.shopAll}
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={href(locale, { key: "category", categoryId: c.id })}
                    onClick={onClose}
                    className="flex min-h-13 items-center py-3 font-display text-[1.3rem]"
                  >
                    {c.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <ul className="grid gap-1">
            {secondary.map((item) => (
              <li key={item.ref.key}>
                <Link href={href(locale, item.ref)} onClick={onClose} className="flex min-h-11 items-center text-[0.95rem] text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <p className="eyebrow mb-3">{t.language.label}</p>
            <LanguageSwitcher variant="menu" />
          </div>
        </div>
      </div>
    </div>
  );
}
