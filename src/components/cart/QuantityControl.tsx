"use client";

import { useI18n } from "@/components/I18nProvider";
import { MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { MAX_QTY } from "./CartProvider";

export function QuantityControl({
  value,
  onChange,
  min = 1,
  size = "md",
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const { t } = useI18n();
  const btn = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div
      className={`inline-flex items-center rounded-full border border-line bg-paper ${size === "sm" ? "h-9" : "h-12"}`}
      role="group"
      aria-label={label ?? t.product.quantity}
    >
      <button
        type="button"
        className={`${btn} inline-flex items-center justify-center rounded-full text-charcoal transition-colors hover:bg-linen disabled:opacity-35`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t.product.decrease}
      >
        <MinusIcon size={16} />
      </button>
      <output className="min-w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={`${btn} inline-flex items-center justify-center rounded-full text-charcoal transition-colors hover:bg-linen disabled:opacity-35`}
        onClick={() => onChange(Math.min(MAX_QTY, value + 1))}
        disabled={value >= MAX_QTY}
        aria-label={t.product.increase}
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
