import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/format";

export function Price({
  amount,
  locale,
  sampleLabel,
  className,
}: {
  amount: number;
  locale: Locale;
  /** e.g. "Sample price" — always shown while prices are placeholders. */
  sampleLabel: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className ?? ""}`}>
      <span className="tabular-nums">{formatPrice(amount, locale)}</span>
      <span className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-taupe-deep">{sampleLabel}</span>
    </span>
  );
}
