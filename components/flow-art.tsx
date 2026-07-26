/* ============================================================
   Flow art — the decorative ribbon system behind the landing page.

   Everything here is a stroke: long bezier ribbons that cross the
   viewport, undulating squiggle rules that replace straight
   dividers, and scattered arc fragments — pieces of ribbon caught
   mid-turn. All of it is aria-hidden and pointer-events-none; it
   never carries meaning, only motion.

   Gradient ids are namespaced per component so several fields can
   share a page without their <defs> colliding.
   ============================================================ */

import type { CSSProperties } from "react";

/* The shared ribbon palette, defined once per SVG that needs it. */
function RibbonDefs({ ns }: { ns: string }) {
  return (
    <defs>
      <linearGradient id={`${ns}-blue`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#1b3ce8" />
        <stop offset="60%" stopColor="#0a72f0" />
        <stop offset="100%" stopColor="#06a3f0" />
      </linearGradient>
      <linearGradient id={`${ns}-full`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#1b3ce8" />
        <stop offset="34%" stopColor="#06a3f0" />
        <stop offset="66%" stopColor="#00d3dd" />
        <stop offset="100%" stopColor="#16e3a2" />
      </linearGradient>
      <linearGradient id={`${ns}-mint`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00d3dd" />
        <stop offset="100%" stopColor="#16e3a2" />
      </linearGradient>
    </defs>
  );
}

/* ---- Hero backdrop ---------------------------------------------------
   Four ribbons at three depths: two huge blurred masses that read as
   colour rather than line, and two crisp strokes travelling over
   them. `slice` keeps the curves' proportions intact at any aspect
   ratio — the field crops rather than distorting. */
export function HeroRibbons() {
  return (
    <svg
      aria-hidden
      className="ribbon-field"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <RibbonDefs ns="hero" />

      {/* Deep colour mass — pure atmosphere, no readable edge. */}
      <g className="ribbon-drift-slow" style={{ filter: "blur(70px)", opacity: 0.55 }}>
        <path
          d="M-220 160C180 60 420 320 780 236C1140 152 1260 -40 1660 60"
          stroke="url(#hero-blue)"
          strokeWidth={200}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Mint mass, low and to the right — where the ribbon lands. */}
      <g className="ribbon-drift" style={{ filter: "blur(80px)", opacity: 0.45 }}>
        <path
          d="M-160 820C240 880 520 700 860 720C1180 738 1300 560 1640 600"
          stroke="url(#hero-mint)"
          strokeWidth={190}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* The signature ribbon — wide, soft-edged, sweeping through the
          middle of the page behind the headline. */}
      <g className="ribbon-drift" style={{ filter: "blur(2px)", opacity: 0.75 }}>
        <path
          d="M-180 690C140 716 250 372 522 352C794 332 878 618 1140 556C1364 504 1440 292 1640 316"
          stroke="url(#hero-full)"
          strokeWidth={86}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Crisp counter-stroke crossing it the other way. */}
      <g className="ribbon-drift-fast" style={{ opacity: 0.9 }}>
        <path
          className="ribbon-flow"
          d="M-140 300C200 236 300 520 620 500C940 480 1000 176 1300 208C1452 224 1520 300 1620 344"
          stroke="url(#hero-full)"
          strokeWidth={22}
          strokeDasharray="300 60"
          fill="none"
        />
      </g>

      {/* Hairline trailing the others — the ribbon's own highlight. */}
      <g className="ribbon-drift-slow" style={{ opacity: 0.6 }}>
        <path
          className="ribbon-flow ribbon-flow-slow"
          d="M-120 530C260 474 420 704 764 692C1064 682 1180 428 1520 470"
          stroke="url(#hero-mint)"
          strokeWidth={7}
          strokeDasharray="180 90"
          fill="none"
        />
      </g>
    </svg>
  );
}

/* ---- Section backdrop ------------------------------------------------
   A quieter two-ribbon field for the sections below the fold, so the
   flow continues down the page without ever competing with copy. */
export function SectionRibbons({
  flip = false,
  className = "",
}: {
  /** Mirrors the curves so consecutive sections don't repeat. */
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      className={`ribbon-field ${className}`}
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMid slice"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <RibbonDefs ns={flip ? "sec-b" : "sec-a"} />
      <g
        className="ribbon-drift-slow"
        style={{ filter: "blur(60px)", opacity: 0.4 }}
      >
        <path
          d="M-200 480C220 540 420 240 780 300C1140 360 1300 140 1660 210"
          stroke={`url(#${flip ? "sec-b" : "sec-a"}-full)`}
          strokeWidth={170}
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <g className="ribbon-drift" style={{ opacity: 0.35 }}>
        <path
          className="ribbon-flow ribbon-flow-slow"
          d="M-140 200C240 150 400 420 760 400C1080 382 1220 180 1600 240"
          stroke={`url(#${flip ? "sec-b" : "sec-a"}-full)`}
          strokeWidth={12}
          strokeDasharray="220 110"
          fill="none"
        />
      </g>
    </svg>
  );
}

/* ---- App canvas ------------------------------------------------------
   The quietest field of all: one blurred mass and two thin squiggles
   drifting behind the working views, so the app sits in the same
   water as the landing page without ever competing with content.
   Opacity is held down by `.app-flow-field` rather than here, so the
   two themes can dial it independently. */
export function AppRibbons() {
  return (
    <div aria-hidden className="app-flow-field">
      <svg
        className="ribbon-field"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <RibbonDefs ns="app" />
        <g
          className="ribbon-drift-slow"
          style={{ filter: "blur(90px)", opacity: 0.7 }}
        >
          <path
            d="M-220 300C200 200 420 520 800 430C1160 344 1300 120 1680 200"
            stroke="url(#app-full)"
            strokeWidth={230}
            strokeLinecap="round"
          />
        </g>
        {/* Solid, not dashed: at this opacity a dash pattern cropped by
            the viewport reads as stray marks rather than as a ribbon
            passing behind the page. */}
        <g className="ribbon-drift">
          <path
            d="M-140 660C260 600 420 820 780 790C1100 762 1240 560 1620 620"
            stroke="url(#app-full)"
            strokeWidth={10}
            strokeLinecap="round"
          />
        </g>
        <g className="ribbon-drift-fast">
          <path
            d="M-120 160C240 110 400 380 760 360C1080 342 1220 140 1600 200"
            stroke="url(#app-mint)"
            strokeWidth={6}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

/* ---- Squiggle rule ---------------------------------------------------
   The house divider. A wave tiled wide enough to overflow the
   viewport on both sides, then slid sideways forever — so it reads
   as a current running across the page rather than a line under it. */
export function Squiggle({ className = "" }: { className?: string }) {
  /* One 120px period, repeated — the animation travels exactly one
     period, so the loop is seamless. */
  const period = "q 30 -22 60 0 t 60 0";
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1560 44"
        className="h-11 w-full min-w-[900px]"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="squiggle-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1b3ce8" stopOpacity="0" />
            <stop offset="22%" stopColor="#06a3f0" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#00d3dd" stopOpacity="0.9" />
            <stop offset="82%" stopColor="#16e3a2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16e3a2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="squiggle-run"
          d={`M-120 22 ${period} ${period} ${period} ${period} ${period} ${period} ${period} ${period} ${period} ${period} ${period} ${period} ${period} ${period}`}
          stroke="url(#squiggle-grad)"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ---- Arc confetti ----------------------------------------------------
   Fragments of ribbon scattered across the hero — the same semicircle
   motif at different sizes, colours and angles, each bobbing on its
   own delay. Positions are hand-placed to stay clear of the headline. */
const arcs = [
  { top: "14%", left: "6%", size: 46, color: "#06a3f0", r: -18, d: "0s" },
  { top: "24%", left: "88%", size: 62, color: "#16e3a2", r: 132, d: "1.4s" },
  { top: "62%", left: "4%", size: 38, color: "#ffffff", r: 74, d: "2.2s" },
  { top: "72%", left: "92%", size: 44, color: "#00d3dd", r: -56, d: "0.8s" },
  { top: "8%", left: "72%", size: 30, color: "#ffffff", r: 20, d: "3s" },
  { top: "80%", left: "20%", size: 54, color: "#1b3ce8", r: 160, d: "1.9s" },
  { top: "44%", left: "95%", size: 26, color: "#16e3a2", r: 40, d: "2.6s" },
  { top: "88%", left: "62%", size: 34, color: "#06a3f0", r: -100, d: "0.4s" },
];

export function ArcConfetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {arcs.map((a, i) => (
        <svg
          key={i}
          viewBox="0 0 40 24"
          width={a.size}
          height={a.size * 0.6}
          fill="none"
          className="arc-bob absolute opacity-70"
          style={
            {
              top: a.top,
              left: a.left,
              "--r": `${a.r}deg`,
              "--d": a.d,
            } as CSSProperties
          }
        >
          <path
            d="M4 22a16 16 0 0 1 32 0"
            stroke={a.color}
            strokeWidth={7}
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}

/* ---- Step connector --------------------------------------------------
   The wavy line threading the three "how it works" steps together —
   desktop only, where the steps actually sit in a row. */
export function StepConnector() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-6 hidden h-16 w-full md:block"
      viewBox="0 0 1000 60"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="step-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1b3ce8" stopOpacity="0" />
          <stop offset="20%" stopColor="#06a3f0" stopOpacity="0.75" />
          <stop offset="80%" stopColor="#16e3a2" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#16e3a2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="ribbon-flow ribbon-flow-slow"
        d="M40 30C180 -8 300 68 470 30C640 -8 780 68 960 30"
        stroke="url(#step-grad)"
        strokeWidth={3}
        strokeDasharray="26 16"
      />
    </svg>
  );
}
