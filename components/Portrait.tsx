import type { AgentId } from "@/lib/agents";

/**
 * Illustrated portraits, one per agent.
 *
 * Deliberately illustrated rather than photographic: these are agents, and a
 * photo would imply a person who exists. Flat vector portraits read as
 * teammates without pretending to be real people — the same choice Slack and
 * Notion make for default avatars.
 *
 * Portraits do NOT theme-switch. A real avatar is a picture, and pictures do
 * not change colour when the UI does.
 */

interface Palette {
  bg: string;
  skin: string;
  hair: string;
  /** Shirt / shoulders. */
  wear: string;
}

const P: Record<AgentId, Palette> = {
  claudia: { bg: "#EDE7F9", skin: "#E0A47C", hair: "#3A2C48", wear: "#6D5296" },
  augustus: { bg: "#DDEAF8", skin: "#9A6440", hair: "#26262B", wear: "#3C6E9E" },
  julius: { bg: "#D9F0EA", skin: "#F0C6A0", hair: "#B0743F", wear: "#2F7D6B" },
  athena: { bg: "#FAECD2", skin: "#C88A5C", hair: "#43331F", wear: "#A9713A" },
  hephaestus: { bg: "#FADEE3", skin: "#E7B189", hair: "#4E3A2C", wear: "#B4566A" },
};

/** Shared base: background, shoulders, head, and a warm neutral expression. */
function Base({
  p,
  children,
}: {
  p: Palette;
  children?: React.ReactNode;
}) {
  return (
    <>
      <rect width="64" height="64" fill={p.bg} />
      {/* shoulders */}
      <path d="M8 64c0-12.2 10.7-19 24-19s24 6.8 24 19H8Z" fill={p.wear} />
      {/* neck */}
      <path d="M27 38h10v10c0 1.7-2.2 3-5 3s-5-1.3-5-3V38Z" fill={p.skin} />
      {/* head */}
      <ellipse cx="32" cy="28" rx="13" ry="14.5" fill={p.skin} />
      {children}
      {/* eyes */}
      <ellipse cx="27" cy="28" rx="1.5" ry="1.9" fill="#2C2622" />
      <ellipse cx="37" cy="28" rx="1.5" ry="1.9" fill="#2C2622" />
      {/* mouth */}
      <path
        d="M29 34.5c1.1 1.3 2.1 1.9 3 1.9s1.9-.6 3-1.9"
        stroke="#2C2622"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
    </>
  );
}

function Glasses({ color = "#33333A" }: { color?: string }) {
  return (
    <g stroke={color} strokeWidth="1.3" fill="none" opacity="0.9">
      <circle cx="27" cy="28" r="4.4" />
      <circle cx="37" cy="28" r="4.4" />
      <path d="M31.4 28h1.2M22.6 27l-2.2.8M41.4 27l2.2.8" strokeLinecap="round" />
    </g>
  );
}

function Claudia() {
  const p = P.claudia;
  return (
    <Base p={p}>
      {/* bob with a side part */}
      <path
        d="M19 29c-.6-9.4 5-16 13-16s13.6 6.6 13 16c-.3 4.6-1.4 7-1.4 7l-1.8-9.4c-6 1.6-13.2.6-17.4-3.2-1.4 2.6-2 7.6-2 12.6L19 29Z"
        fill={p.hair}
      />
    </Base>
  );
}

function Augustus() {
  const p = P.augustus;
  return (
    <Base p={p}>
      {/* cropped hair */}
      <path d="M19.4 26c.6-8 5.8-12.6 12.6-12.6S44 18 44.6 26c-2-4.6-6.6-7-12.6-7s-10.6 2.4-12.6 7Z" fill={p.hair} />
      {/* beard */}
      <path
        d="M20.4 29c0 8.4 5.2 14.6 11.6 14.6S43.6 37.4 43.6 29c1 6-.4 11-3.4 14.2-2.2 2.4-5 3.6-8.2 3.6s-6-1.2-8.2-3.6c-3-3.2-4.4-8.2-3.4-14.2Z"
        fill={p.hair}
        opacity="0.92"
      />
    </Base>
  );
}

function Julius() {
  const p = P.julius;
  return (
    <Base p={p}>
      <path
        d="M19.6 27.4c0-8.6 5.2-14 12.4-14s12.4 5.4 12.4 14c-1.4-5-3-7.2-5-7.8-2.6 2.6-13.6 3-16.6.6-1.6 1.4-2.6 4-3.2 7.2Z"
        fill={p.hair}
      />
      <Glasses />
    </Base>
  );
}

function Athena() {
  const p = P.athena;
  return (
    <Base p={p}>
      {/* pulled back, with a bun */}
      <path d="M19.4 28c0-9.2 5.4-14.6 12.6-14.6S44.6 18.8 44.6 28c-1.6-6.6-5.4-10-12.6-10s-11 3.4-12.6 10Z" fill={p.hair} />
      <circle cx="32" cy="11.6" r="4.6" fill={p.hair} />
      <Glasses />
    </Base>
  );
}

function Hephaestus() {
  const p = P.hephaestus;
  return (
    <Base p={p}>
      {/* longer hair swept back */}
      <path
        d="M18.8 31c-1-11 5-17.6 13.2-17.6S46.2 20 45.2 31c-.8-3.4-1.6-6-2.6-7.8-4.4 2.6-16 2.6-21.2-.4-1 1.8-1.8 4.6-2.6 8.2Z"
        fill={p.hair}
      />
      {/* short beard */}
      <path
        d="M21.6 31c0 7.8 4.6 13.4 10.4 13.4S42.4 38.8 42.4 31c.8 5.2-.4 9.6-3 12.4-2 2.2-4.6 3.2-7.4 3.2s-5.4-1-7.4-3.2c-2.6-2.8-3.8-7.2-3-12.4Z"
        fill={p.hair}
        opacity="0.9"
      />
    </Base>
  );
}

const PORTRAITS: Record<AgentId, () => React.JSX.Element> = {
  claudia: Claudia,
  augustus: Augustus,
  julius: Julius,
  athena: Athena,
  hephaestus: Hephaestus,
};

export function Portrait({ agentId, size = 36 }: { agentId: AgentId; size?: number }) {
  const Art = PORTRAITS[agentId];
  if (!Art) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <Art />
    </svg>
  );
}
