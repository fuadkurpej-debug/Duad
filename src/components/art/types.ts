import type { ReactElement } from "react";

/**
 * An illustration draws into a 400 × 500 viewBox (portrait 4:5) WITHOUT a
 * background (the tile provides it). Conventions:
 *  - the object stands on an implied floor at y ≈ 420, centred on x = 200,
 *    with a soft contact shadow: <ellipse cx=200 cy=422 rx=… ry=10 fill={P.shadow}/>
 *  - the object fills roughly 45–65% of the height, leaving calm space above
 *  - flat shapes + subtle linear gradients, no outlines (hairline details at
 *    most 1.5px), light comes from the upper left
 *  - `accent` (optional) is the selected variant colour; use it for the main
 *    coloured part so variant pickers visibly change the illustration
 *  - `uid` must prefix every gradient/clipPath id to keep ids unique on a page
 */
export interface ArtProps {
  accent?: string;
  uid: string;
}

export type ArtComponent = (props: ArtProps) => ReactElement;
