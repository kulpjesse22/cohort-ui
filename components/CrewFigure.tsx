import { AGENTS, type AgentId } from "@/lib/agents";

/**
 * Nendoroid-derived crew figures: oversized head, tiny body, a stand you can
 * see. One chassis for the whole cohort — hair silhouette, hue and rank pips
 * are what differ, so five teammates cost one SVG rather than five assets.
 *
 * Ported from the Cohort Crew prototype. Three things carry meaning and
 * nothing else does:
 *
 *   shape  = identity   — the hair is the only per-agent geometry
 *   eyes   = state      — a skin-coloured lid rides down over one eye object
 *   pips   = rank       — one mid, two senior, three principal, on the sleeve
 *
 * Colour is the machine's power, not decoration. It bleeds in over three
 * quarters of a second when a box wakes and drains when it dies; the stand
 * light dies before the warmth does. An asleep figure is a machine that is
 * off, which is why it goes grey rather than merely dimming.
 *
 * Figures do NOT theme-switch. A real avatar is a picture, and pictures do not
 * change colour when the UI does — so the hue comes from the `fig-*` tokens,
 * which are defined once and never redefined for dark mode.
 */

export type CrewState =
  | "asleep"
  | "booting"
  | "idle"
  | "working"
  | "blocked"
  | "reviewing"
  | "happy";

/** Full body is 48x68; the bust crop is the same SVG through a 46x46 window. */
const FULL_VIEWBOX = "0 0 48 68";
const CROP_VIEWBOX = "1 -2.5 46 46";
const FULL_ASPECT = 0.706;

function Eye({ cx }: { cx: number }) {
  return (
    <g className="eye">
      <g className="eopen">
        <ellipse className="ewhite" cx={cx} cy="25.6" rx="3.9" ry="4.8" />
        <g className="iris">
          <ellipse className="iris1" cx={cx} cy="26.2" rx="3.2" ry="3.9" />
          <ellipse className="pupil" cx={cx} cy="26.6" rx="1.4" ry="1.9" />
          <circle className="shine" cx={cx - 1.4} cy="23.6" r="1.3" />
          <circle className="shine2" cx={cx + 1.5} cy="28.4" r="0.7" />
        </g>
        {/* the lid is one object riding down over the whole eye, not a redraw */}
        <g className="lid">
          <ellipse className="skin" cx={cx} cy="17.4" rx="4.5" ry="5" />
          <path className="lash" d={`M${cx - 4.2} 21.7q4.2-3.3 8.4 0`} />
        </g>
      </g>
      <path className="eshut e-sleep lash" d={`M${cx - 3.6} 25q3.6 3.4 7.2 0`} />
      <path className="eshut e-happy lash" d={`M${cx - 3.6} 27.4q3.6-4 7.2 0`} />
    </g>
  );
}

/** Stand, legs, torso, sleeves and rank pips. Identical for every teammate. */
function Body() {
  return (
    <>
      <ellipse className="stand" cx="24" cy="65.4" rx="13" ry="2.7" />
      <rect className="stand" x="21.8" y="56" width="4.4" height="9" rx="2" />
      <circle className="led" cx="24" cy="65.4" r="1.7" />
      <g className="body">
        <rect className="skin" x="17.6" y="54.4" width="5.6" height="9.6" rx="2.6" />
        <rect className="skin" x="24.8" y="54.4" width="5.6" height="9.6" rx="2.6" />
        <rect className="hd" x="17.2" y="60.6" width="6.4" height="4.2" rx="1.9" />
        <rect className="hd" x="24.4" y="60.6" width="6.4" height="4.2" rx="1.9" />
        <rect
          className="hue"
          x="10.4"
          y="40.6"
          width="6.2"
          height="13.4"
          rx="3.1"
          transform="rotate(-7 13.5 47)"
        />
        <rect
          className="hue"
          x="31.4"
          y="40.6"
          width="6.2"
          height="13.4"
          rx="3.1"
          transform="rotate(7 34.5 47)"
        />
        <circle className="skin" cx="12.4" cy="54.6" r="2.8" />
        <circle className="skin" cx="35.6" cy="54.6" r="2.8" />
        <path
          className="hue"
          d="M24 37.6c-6.6 0-9.9 2.3-10.5 6.6-.5 3.7-.7 8.6-.7 12.6h22.4c0-4-.2-8.9-.7-12.6-.6-4.3-3.9-6.6-10.5-6.6z"
        />
        <path className="trim" d="M19 38.4 24 45.4l5-7" />
        <rect className="hd" x="13.2" y="48.8" width="21.6" height="3.8" rx="1.2" />
        <rect className="pip p1" x="10.8" y="43.4" width="4.4" height="1.5" rx=".75" transform="rotate(-7 13 44)" />
        <rect className="pip p2" x="10.9" y="45.9" width="4.4" height="1.5" rx=".75" transform="rotate(-7 13 46.5)" />
        <rect className="pip p3" x="11" y="48.4" width="4.4" height="1.5" rx=".75" transform="rotate(-7 13 49)" />
      </g>
    </>
  );
}

/** Blush, eyes, brows and mouth. The brows and lids carry the whole mood. */
function Face() {
  return (
    <>
      <ellipse className="blush" cx="13.6" cy="29" rx="3.5" ry="2.1" />
      <ellipse className="blush" cx="34.4" cy="29" rx="3.5" ry="2.1" />
      <g className="eyes">
        <Eye cx={17.4} />
        <Eye cx={30.6} />
      </g>
      <path className="brow bl" d="M13.6 17.2q3.7-2.1 6.8-.5" />
      <path className="brow br" d="M34.4 17.2q-3.7-2.1-6.8-.5" />
      <path className="mouth" d="M22.5 32.6q1.5 1.7 3 0" />
      <path className="mouth-o" d="M21.6 32q2.4 3.6 4.8 0z" />
    </>
  );
}

/** Hair mass behind the head, and the head itself with its ears. */
const BACK = (
  <path
    className="hd"
    d="M24 1.8C12.6 1.8 4.4 10.4 4.4 22.6c0 6 1.3 10.7 2.8 14 .6-4.8.4-10 1.5-13.5C10.8 15.9 16.3 12.4 24 12.4s13.2 3.5 15.3 10.7c1.1 3.5.9 8.7 1.5 13.5 1.5-3.3 2.8-8 2.8-14C43.6 10.4 35.4 1.8 24 1.8z"
  />
);

const HEADSHAPE = (
  <>
    <circle className="skin" cx="24" cy="22" r="17.4" />
    <ellipse className="skin" cx="6.9" cy="24.4" rx="2" ry="2.7" />
    <ellipse className="skin" cx="41.1" cy="24.4" rx="2" ry="2.7" />
  </>
);

/** A streak at the temple, shown from senior up. Earned, not decorative. */
const GREY = (
  <path
    className="grey"
    d="M12.2 15.6c1.6-4.6 4.6-7.8 8.4-9.2-1 3.6-1.4 7-1.2 10.4-2.6-1.4-5-1.8-7.2-1.2z"
  />
);

/* Anime shorthand, and the only two glyphs in the figure: a z when the machine
   is off, a sweat bead when the teammate is held and needs a call from you. */
const ZZZ = (
  <text className="zzz" x="38" y="10">
    z
  </text>
);

const SWEAT = (
  <path
    className="sweat"
    fill="#8ecff5"
    opacity=".9"
    d="M39.8 10.4c1.7 2.2 2.8 3.6 2.8 4.9a2.8 2.8 0 1 1-5.6 0c0-1.3 1.1-2.7 2.8-4.9z"
  />
);

function Head({ children }: { children: React.ReactNode }) {
  return (
    <g className="head">
      {BACK}
      {HEADSHAPE}
      <Face />
      {children}
      {ZZZ}
      {SWEAT}
    </g>
  );
}

/* ---- five silhouettes, one chassis ------------------------------------- */

const HAIR: Record<AgentId, React.ReactNode> = {
  /* Claudia — planner. Side-swept bob, a long ahoge, a pennant clip. */
  claudia: (
    <>
      <path
        className="hue"
        d="M6.4 24.4C5.6 12.4 13 2.6 24 2.6s18.4 9.8 17.6 21.8c-1.6-1.4-2.2-4.2-2.3-6.8-1.7 2.4-4 3.9-6.3 3.1.4-2 0-3.8-1-5.1-1.9 3-5.1 4.8-8.1 4.3.7-1.8.7-3.5.2-4.9-2.4 3.2-6.3 5.2-10 4.9.9-1.6 1.4-3.2 1.4-4.5-2.3 3-5.8 5-9.1 5z"
      />
      {GREY}
      <path
        className="ahoge hueline"
        strokeWidth="2.3"
        d="M24.6 3.4c1-4.6 6.4-5 6.6-1 .2 3.2-3.4 4.2-5 2"
      />
      <path className="hue" d="M37.4 15.2 43.6 13l-5.4 3.6z" />
    </>
  ),

  /* Hephaestus — the smith. Heavy shaggy fringe, forge visor, grey beard. */
  hephaestus: (
    <>
      <path
        className="beard"
        d="M14.6 30.6c0 6.6 4.2 9.8 9.4 9.8s9.4-3.2 9.4-9.8c-2.7 2.4-5.9 3.4-9.4 3.4s-6.7-1-9.4-3.4z"
      />
      <path
        className="hue"
        d="M6.2 25C5.4 12.2 13 2.4 24 2.4S42.6 12.2 41.8 25c-1.8-1.8-2.4-5-2.5-7.6-2 3-4.6 4.4-7.1 3.4.3-2.2-.2-4-1.3-5.3-2.1 3.4-5.4 5.2-8.6 4.6.6-2 .5-3.8-.1-5.2-2.6 3.4-6.4 5.4-10.2 5 .8-1.8 1.2-3.5 1.2-4.9-2.4 3.2-5.6 5.2-7 5z"
      />
      {GREY}
      <g className="visor">
        <path className="hd" d="M8.2 13.4q15.8-5.2 31.6 0v4.4q-15.8-4.4-31.6 0z" />
        <path className="trim" opacity=".5" d="M12.6 14.8q11.4-2.4 22.8 0" />
      </g>
    </>
  ),

  /* Augustus — builder. Short spikes under a knotted hachimaki. */
  augustus: (
    <>
      <path
        className="hue"
        d="M6.4 24C5.6 12 13 2.5 24 2.5S42.4 12 41.6 24c-1.5-2.2-2-4.6-2-7-1.7 2.6-3.6 4-5.3 3.2.1-2.2-.5-4-1.6-5.2-1.6 2.8-3.8 4.2-5.7 3.6.2-2.2-.4-4-1.5-5.2-1.7 2.8-4 4.2-6 3.6.2-2.2-.4-3.9-1.4-5.1-1.8 2.8-4.2 4.3-6.3 3.7-.1 2.6-.7 5.2-2 7.4z"
      />
      {GREY}
      <path className="band" d="M7.4 17.6q16.6-5 33.2 0" />
      <circle className="pip knot" cx="40.6" cy="17.6" r="2.2" />
      <path className="band tail" d="M42.4 17 46.4 14.6M42.4 18.4 45.8 20.6" />
    </>
  ),

  /* Julius — the junior. Soft rounded bowl fringe and one stubborn cowlick. */
  julius: (
    <>
      <path
        className="hue"
        d="M6.6 25.4C5.8 12.6 13.2 2.8 24 2.8s18.2 9.8 17.4 22.6c-1.4-2.4-1.8-5.4-1.8-8.4-3.6 3.4-9 5.2-15.6 5.2s-12-1.8-15.6-5.2c0 3-.4 6-1.8 8.4z"
      />
      {GREY}
      <path
        className="ahoge hueline"
        strokeWidth="2.2"
        d="M23.8 3.2c1.4-3.4 5.6-3.2 5.4.4-.2 2.6-3 3-4.2 1.4"
      />
    </>
  ),

  /* Athena — reviewer. Long centre-parted hair, reading glasses, laurel pin. */
  athena: (
    <>
      <path
        className="hue"
        d="M6.2 26C5.4 12.4 13 2.4 24 2.4S42.6 12.4 41.8 26c-1.2-2-1.6-4.8-1.7-7.6-1.4-6-6-10-11.5-10.6.6 2.2.2 4.2-1 5.6-2.4-3.6-6.6-5.6-11-5-4.4 2-7.2 5.6-8.2 10-.1 2.8-.5 5.6-1.7 7.6z"
      />
      <path
        className="hd"
        d="M5 24c-.6 6.4-.2 11.8 1.2 15.6.8-4.2 1-8.8 1.2-13zM43 24c.6 6.4.2 11.8-1.2 15.6-.8-4.2-1-8.8-1.2-13z"
      />
      {GREY}
      <path className="hueline laurel" strokeWidth="1.8" d="M8.6 12c-2.8-1.8-3.4-4.8-2-7.4 2.8.8 4.4 3 4.6 5.6" />
      <g className="glasses">
        <circle className="glass" cx="17.4" cy="25.8" r="5.4" />
        <circle className="glass" cx="30.6" cy="25.8" r="5.4" />
        <path className="glass" d="M22.8 25.4h2.4M12 24.6 8.6 23.4M36 24.6l3.4-1.2" />
        <path className="glint" fill="#fff" opacity=".8" d="M13.4 29.6 19 21.6l2.2 1.2-5.6 8z" />
      </g>
    </>
  ),
};

/**
 * Staggered timings. Five figures blinking and glancing on the same clock read
 * as one animation played five times; the offsets are what make them read as
 * five separate people who happen to be in the same room.
 */
function rhythm(agentId: AgentId): React.CSSProperties {
  const n = Math.max(0, Object.keys(HAIR).indexOf(agentId));
  return {
    "--bd": `${(4.9 + n * 0.83).toFixed(2)}s`,
    "--gd": `${(9.5 + n * 1.7).toFixed(2)}s`,
    "--ad": `${(3.1 + n * 0.44).toFixed(2)}s`,
  } as React.CSSProperties;
}

export function CrewFigure({
  agentId,
  size = 36,
  state = "idle",
  crop = true,
  color,
}: {
  agentId: AgentId;
  /** Rendered height in px. Full-body width follows at 0.706 of it. */
  size?: number;
  state?: CrewState;
  /** Bust crop for list rows; false stands the whole figure on its base. */
  crop?: boolean;
  /** Overrides the roster colour — for live preview while one is being picked. */
  color?: string;
}) {
  const agent = AGENTS[agentId];
  const hue = color ?? agent.color;

  return (
    <svg
      className={`crew fig-${hue}${crop ? " crew-crop" : ""}`}
      data-state={state}
      data-rank={agent.rank}
      style={rhythm(agentId)}
      width={crop ? size : Math.round(size * FULL_ASPECT)}
      height={size}
      viewBox={crop ? CROP_VIEWBOX : FULL_VIEWBOX}
      role="img"
      aria-label={`${agent.name}, ${state}`}
    >
      <Body />
      <Head>{HAIR[agentId]}</Head>
    </svg>
  );
}
