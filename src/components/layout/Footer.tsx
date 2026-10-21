import Link from "next/link";
import { BRAND } from "@/config/brand";
import { categories } from "@/data/categories";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { href, type RouteRef } from "@/lib/routes";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { LogoMark } from "./Logo";

export function Footer({ locale, t }: { locale: Locale; t: Messages }) {
  const col = (title: string, links: { label: string; ref: RouteRef }[]) => (
    <div>
      <h2 className="eyebrow mb-4 !text-sand">{title}</h2>
      <ul className="grid gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={href(locale, l.ref)} className="text-[0.9rem] text-paper/80 transition-colors hover:text-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="mt-24 bg-charcoal text-paper">
      <div className="container-page grid gap-12 pt-16 pb-10 lg:grid-cols-[1.3fr_2fr] lg:gap-16 lg:pt-20">
        <div className="max-w-md">
          <div className="flex items-center gap-3 text-paper">
            <LogoMark size={34} />
            <span className="font-display text-[1.6rem] tracking-[0.14em] uppercase">{BRAND.name}</span>
          </div>
          <p className="mt-2 font-display text-[1.15rem] text-sand italic">{BRAND.tagline[locale]}</p>
          <p className="mt-5 text-[0.9rem] leading-relaxed text-paper/70">{t.footer.about}</p>
          <div className="mt-8">
            <p className="mb-3 text-[0.9rem] font-semibold">{t.home.newsletterTitle}</p>
            <NewsletterForm tone="dark" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {col(
            t.footer.shop,
            [{ label: t.nav.shopAll, ref: { key: "shop" } as RouteRef }].concat(
              categories.slice(0, 5).map((c) => ({ label: c.name[locale], ref: { key: "category", categoryId: c.id } as RouteRef })),
            ),
          )}
          {col(t.footer.help, [
            { label: t.footer.faq, ref: { key: "faq" } },
            { label: t.footer.shipping, ref: { key: "shipping" } },
            { label: t.footer.returns, ref: { key: "returns" } },
            { label: t.footer.tracking, ref: { key: "tracking" } },
          ])}
          {col(t.footer.company, [
            { label: t.footer.about_link, ref: { key: "about" } },
            { label: t.footer.contact, ref: { key: "contact" } },
          ])}
          {col(t.footer.legal, [
            { label: t.footer.privacy, ref: { key: "privacy" } },
            { label: t.footer.terms, ref: { key: "terms" } },
          ])}
        </div>
      </div>
      <div className="border-t border-paper/12">
        <div className="container-page flex flex-col gap-2 py-6 text-[0.78rem] text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.fullName}. {t.footer.rights}
          </p>
          <p>{t.footer.payments}</p>
        </div>
      </div>
    </footer>
  );
}
