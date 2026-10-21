import { productArt } from "@/components/art/products";
import { P, TONE_BG } from "@/components/art/palette";
import type { ArtTone } from "@/data/types";

function Fallback({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-fb`} x1="0" x2="1">
          <stop offset="0" stopColor={P.sand} />
          <stop offset="1" stopColor={P.sandDeep} />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="422" rx="92" ry="10" fill={P.shadow} />
      <path d="M130 420c-8-70 0-150 30-190h80c30 40 38 120 30 190z" fill={`url(#${uid}-fb)`} />
      <ellipse cx="200" cy="230" rx="40" ry="8" fill={P.taupe} />
    </g>
  );
}

/**
 * Original illustration for a product (stand-in until supplier photography
 * is available). Renders a 4:5 tile.
 */
export function ProductArt({
  kind,
  tone,
  accent,
  uid,
  label,
  className,
  sizes = "card",
}: {
  kind: string;
  tone: ArtTone;
  accent?: string;
  uid: string;
  /** Accessible name; omit for decorative use. */
  label?: string;
  className?: string;
  sizes?: "card" | "hero";
}) {
  const Art = productArt[kind];
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid slice"
      data-art-kind={kind}
    >
      <defs>
        <radialGradient id={`${safeUid}-bgglow`} cx="0.3" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity={sizes === "hero" ? 0.55 : 0.45} />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={TONE_BG[tone]} />
      <rect width="400" height="500" fill={`url(#${safeUid}-bgglow)`} />
      {/* soft floor plane */}
      <rect y="420" width="400" height="80" fill="#000" opacity="0.025" />
      {Art ? <Art uid={safeUid} accent={accent} /> : <Fallback uid={safeUid} />}
    </svg>
  );
}
