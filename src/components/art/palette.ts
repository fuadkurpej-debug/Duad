/**
 * Fixed illustration palette. All product/lifestyle illustrations must use
 * ONLY these colours (plus white/black with opacity for light and shadow)
 * so every tile reads as one consistent art direction.
 */
export const P = {
  ivory: "#F7F3EC",
  softWhite: "#FCFAF6",
  linen: "#EDE5D8",
  sand: "#DCCFBC",
  sandDeep: "#C9B89F",
  taupe: "#A39383",
  taupeDeep: "#7A6B5D",
  charcoal: "#2B2926",
  ink: "#57524C",
  sage: "#9AA591",
  sageDeep: "#6E7B66",
  sageLight: "#C9D0C1",
  oak: "#C29A6B",
  oakLight: "#DDBF98",
  walnut: "#8A6544",
  brass: "#B08D57",
  clay: "#C08A6E",
  stone: "#D9D5CE",
  /** Translucent glass body. */
  glass: "rgba(255,255,255,0.42)",
  /** Highlight / specular. */
  light: "rgba(255,255,255,0.55)",
  /** Ground contact shadow. */
  shadow: "rgba(43,41,38,0.10)",
} as const;

/** Background colour of an illustration tile, per ArtTone. */
export const TONE_BG = {
  ivory: "#F3EEE5",
  linen: "#ECE4D7",
  sand: "#E5DACA",
  sage: "#DDE1D5",
  taupe: "#E4DCD2",
  oak: "#ECDFCC",
  stone: "#E7E4DE",
} as const;
