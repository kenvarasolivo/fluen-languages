/* ============================================================
   The FLUEN logo — the name *is* the mark.

   Every letter is drawn as a monoline ribbon stroke on one shared
   skeleton (baseline 72, x-height 32, ascender 8, stroke 11, round
   caps and joins), so "fluen" reads as five bends of a single
   continuous ribbon rather than a typeface with a logo bolted onto
   it. One gradient runs across the whole word, blue at the f and
   mint by the n — the same journey the landing page's ribbons make.

   The x-height is deliberately generous relative to the stroke: at a
   tighter one the e's counters clog and it collapses into a ringed
   circle. Same reason the f's crossbar is a single smooth arc rather
   than a wave — an S-curve at this weight reads as a blob, not flow.

   There is deliberately no separate icon: pairing a stylised "f"
   with the word made it read as "f fluen".

   Two tones:
     "gradient"  the blue→azure→cyan→mint ribbon — the default
     "white"     solid currentColor, for surfaces already painted in
                 the brand gradient (sidebar, app headers) where the
                 gradient would disappear into its own background
   ============================================================ */

type Tone = "gradient" | "white";

/* The word's natural proportions — width follows from the requested
   height so the logo can never be set off-ratio. */
const VIEW_W = 246;
const VIEW_H = 81;

/* Each glyph as a stroke skeleton. Written out rather than generated
   so the curves can be tuned individually — an "l" that flicks and a
   "u" that doesn't are what stop this reading as a font. */
const glyphs = [
  /* f — stem rising into a curl that leans over to the right */
  "M30 72V26C30 15 37.5 8.5 47 10.5C52 11.5 56 14.5 58 18.5",
  /* f crossbar — one smooth arc lifting to the right */
  "M12 42C22 38.5 34 41 49 38",
  /* l — a stem that flicks out at the foot instead of stopping dead */
  "M74 8V58C74 68 80.5 73.5 89 72",
  /* u — one unbroken trough */
  "M103 32V55C103 66 110.5 73 119 73C127.5 73 134 66 134 55V32",
  /* e — bowl swept anticlockwise from the crossbar's right end round
     to an open terminal at the lower right; the aperture is what
     stops it reading as a circle */
  "M185 52C185 41.5 176.5 33 166 33C155.5 33 147 41.5 147 52C147 62.5 155.5 71 166 71C170.5 71 174.5 69.5 177.5 67",
  /* e crossbar */
  "M147.5 52H184.5",
  /* n — stem plus arch */
  "M199 73V32",
  "M199 45C202 36.5 209.5 31 217.5 31C227 31 233.5 38 233.5 47.5V73",
];

export function FluenLogo({
  /* Rendered height in px; width follows the word's ratio. */
  height = 28,
  tone = "gradient",
  /** Adds the slow breathing motion used on the login screen. */
  live = false,
  className = "",
}: {
  height?: number;
  tone?: Tone;
  live?: boolean;
  className?: string;
}) {
  const id = `fluen-word-${tone}`;
  const stroke = tone === "white" ? "currentColor" : `url(#${id})`;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      height={height}
      width={(height * VIEW_W) / VIEW_H}
      fill="none"
      role="img"
      aria-label="fluen"
      className={`brand-mark ${live ? "brand-mark-live" : ""} ${className}`}
    >
      {tone === "gradient" && (
        <defs>
          {/* Diagonal so the ribbon climbs as it crosses the word. */}
          <linearGradient
            id={id}
            x1="0"
            y1={VIEW_H}
            x2={VIEW_W}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#1b3ce8" />
            <stop offset="38%" stopColor="#06a3f0" />
            <stop offset="70%" stopColor="#00d3dd" />
            <stop offset="100%" stopColor="#16e3a2" />
          </linearGradient>
        </defs>
      )}
      <g
        stroke={stroke}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyphs.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
