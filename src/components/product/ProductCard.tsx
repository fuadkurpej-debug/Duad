import Link from "next/link";
import type { Product } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { fmt, type Messages } from "@/i18n/messages";
import { href } from "@/lib/routes";
import { Price } from "./Price";
import { ProductArt } from "./ProductArt";
import { getCategory } from "@/data/categories";

export function ProductCard({
  product,
  locale,
  t,
  priority,
}: {
  product: Product;
  locale: Locale;
  t: Messages;
  priority?: boolean;
}) {
  const url = href(locale, { key: "product", productId: product.id });
  const swatches = product.variants?.options.filter((o) => o.swatch) ?? [];
  return (
    <article className="group relative flex flex-col" data-product-card={product.id}>
      <Link
        href={url}
        className="relative block overflow-hidden rounded-[var(--radius-card)] bg-linen"
        aria-label={fmt(t.product.viewProduct, { name: product.name[locale] })}
        prefetch={priority ? true : undefined}
      >
        <ProductArt
          kind={product.art.kind}
          tone={product.art.tone}
          accent={swatches[0]?.swatch}
          uid={`card-${product.id}`}
          className="aspect-[4/5] h-auto w-full transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.035]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-paper/85 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.12em] uppercase text-taupe-deep backdrop-blur-sm">
          {t.product.sampleBadge}
        </span>
      </Link>
      <div className="mt-4 flex flex-1 flex-col gap-1 px-0.5">
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-taupe-deep">
          {getCategory(product.category).name[locale]}
        </p>
        <h3 className="font-display text-[1.2rem] leading-snug text-charcoal">
          <Link href={url} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {product.name[locale]}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-muted">{product.tagline[locale]}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <Price amount={product.price} locale={locale} sampleLabel={t.product.samplePrice} className="text-[0.98rem] font-medium" />
          {swatches.length > 0 && (
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {swatches.slice(0, 4).map((o) => (
                <span
                  key={o.id}
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-charcoal/15"
                  style={{ background: o.swatch }}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
