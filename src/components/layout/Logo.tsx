import { BRAND } from "@/config/brand";

/**
 * Logo concept: a soft "corner" mark — an arched niche (the kutak) holding a
 * small warm light — paired with a tracked serif wordmark.
 */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M6 28V14.5C6 8.7 10.5 4 16 4s10 4.7 10 10.5V28" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 28h20" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="19" r="3" fill="#B08D57" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-charcoal ${className ?? ""}`}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.45rem] tracking-[0.14em] uppercase" style={{ fontWeight: 420 }}>
          {BRAND.name}
        </span>
        <span className="mt-1 text-[0.56rem] font-semibold tracking-[0.42em] uppercase text-taupe-deep">Home</span>
      </span>
    </span>
  );
}
