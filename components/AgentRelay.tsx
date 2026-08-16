"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AGENTS, type AgentId } from "@/lib/agents";
import { Avatar } from "./Avatar";

/**
 * A rail of the people and agents on a task, with work visibly moving between
 * them.
 *
 * The workspace can show that coordination happened — a thread, a handoff file,
 * a task doc. It cannot show coordination *happening*, because a transcript is
 * only ever read after the fact. This is the one surface where the orchestration
 * layer is the subject rather than the plumbing.
 *
 * The pill does not deliver once and stop. It shuttles between the two parties
 * for as long as the work is outstanding, because that back-and-forth is what
 * waiting actually looks like — then it settles when the exchange resolves.
 * Under reduced motion the shuttle is replaced by a pulse in place.
 */

/** "you" is a participant on the rail. The planner's stop only reads if you're on it. */
type RelayActor = AgentId | "user";

export interface Exchange {
  between: [RelayActor, RelayActor];
  label: string;
  /** Half-trips before this exchange resolves. Longer work shuttles longer. */
  shuttles?: number;
}

export interface Scenario {
  id: string;
  prompt: string;
  /** Shown once the rail finishes, as the outcome of the run. */
  outcome: string;
  exchanges: Exchange[];
}

/**
 * Two runs of the same team. The first is the planner refusing to guess; the
 * second is a lesson moving worker-to-worker without the human repeating
 * themselves. Both are the doc's story, told as motion rather than transcript.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "poster",
    prompt: "Make a poster for the site",
    outcome: "Shipped — and you were asked exactly once.",
    exchanges: [
      { between: ["user", "claudia"], label: "Briefing Claudia…", shuttles: 2 },
      { between: ["claudia", "user"], label: "Asking you…", shuttles: 4 },
      { between: ["claudia", "augustus"], label: "Assigning Augustus…", shuttles: 3 },
      { between: ["augustus", "athena"], label: "In review…", shuttles: 4 },
      { between: ["athena", "augustus"], label: "Returning fixes…", shuttles: 3 },
      { between: ["augustus", "claudia"], label: "Approved…", shuttles: 2 },
    ],
  },
  {
    id: "lesson",
    prompt: "Quick follow-up on the settings panel",
    outcome: "Done — the lesson moved between workers, not through you.",
    exchanges: [
      { between: ["user", "claudia"], label: "Briefing Claudia…", shuttles: 2 },
      { between: ["claudia", "julius"], label: "Assigning Julius…", shuttles: 3 },
      { between: ["julius", "augustus"], label: "Asking Augustus…", shuttles: 4 },
      { between: ["augustus", "julius"], label: "Passing the lesson…", shuttles: 4 },
      { between: ["julius", "claudia"], label: "Finishing up…", shuttles: 2 },
    ],
  },
];

/** Left to right, so a pass between neighbours is a short hop. */
const RAIL: RelayActor[] = ["user", "claudia", "augustus", "julius", "athena", "hephaestus"];

const HUE_CLASS: Record<RelayActor, string> = {
  user: "agent-slate",
  claudia: "agent-violet",
  augustus: "agent-sky",
  julius: "agent-teal",
  athena: "agent-amber",
  hephaestus: "agent-rose",
};

function actorName(id: RelayActor): string {
  return id === "user" ? "You" : AGENTS[id].name;
}

/** One half-trip. Slow enough to read the label mid-flight. */
const SHUTTLE_MS = 1100;
/** Pause on arrival before the exchange resolves and the next one starts. */
const SETTLE_MS = 700;

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Subscribed rather than read into state, so it never renders then corrects. */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false
  );
}

export function AgentRelay({
  scenario,
  onFinished,
}: {
  scenario: Scenario;
  onFinished?: () => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [centers, setCenters] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [leg, setLeg] = useState(0);
  const [finished, setFinished] = useState(false);
  const reduced = useReducedMotion();

  const exchange = scenario.exchanges[index];
  const [a, b] = exchange?.between ?? ["user", "claudia"];
  const shuttles = exchange?.shuttles ?? 3;

  // No reset effect here on purpose: the caller remounts this component with a
  // key per run, so a new scenario arrives as fresh state rather than as state
  // that has to be cleaned up.

  // Positions come from measured slot centers rather than a fixed step, so the
  // rail stays correct when it reflows or an actor is dropped from it.
  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const railBox = rail.getBoundingClientRect();
    const next: Record<string, number> = {};
    for (const id of RAIL) {
      const slot = slotRefs.current[id];
      if (!slot) continue;
      const box = slot.getBoundingClientRect();
      next[id] = box.left - railBox.left + box.width / 2;
    }
    setCenters(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [measure]);

  // Shuttle until the exchange has run its legs, then advance. Reduced motion
  // holds one position and lets the dots carry the waiting.
  useEffect(() => {
    if (finished || !exchange) return;

    if (leg >= shuttles) {
      const timer = setTimeout(() => {
        if (index === scenario.exchanges.length - 1) {
          setFinished(true);
          onFinished?.();
        } else {
          setIndex((i) => i + 1);
          setLeg(0);
        }
      }, SETTLE_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setLeg((l) => l + 1), reduced ? SHUTTLE_MS / 2 : SHUTTLE_MS);
    return () => clearTimeout(timer);
  }, [leg, shuttles, index, exchange, finished, reduced, scenario.exchanges.length, onFinished]);

  // Odd legs sit on the far end; the exchange resolves back at its origin.
  const atB = !reduced && leg % 2 === 1;
  const anchor = finished ? scenario.exchanges[scenario.exchanges.length - 1].between[1] : atB ? b : a;
  const x = centers[anchor] ?? 0;
  const measured = Object.keys(centers).length > 0;

  // The pill rests beside whoever holds it, on the side facing the other party —
  // never on top of them. Sitting on the avatar reads as "this agent is a label";
  // sitting beside it reads as "this agent is holding something".
  const toward = (centers[b] ?? 0) >= (centers[a] ?? 0) ? 1 : -1;
  const side = atB ? -toward : toward;
  // Clears the 36px avatar plus its halo. Any larger and the pill stops fitting
  // in the gap between two adjacent actors, which is the tightest case.
  const offset = side > 0 ? "translateX(26px)" : "translateX(calc(-100% - 26px))";

  return (
    <div
      ref={railRef}
      className="relative mx-auto flex w-full max-w-4xl items-center justify-between px-2 py-7"
      role="status"
      aria-live="polite"
      aria-label={
        finished
          ? scenario.outcome
          : `${actorName(a)} and ${actorName(b)}: ${exchange?.label ?? ""}`
      }
    >
      {RAIL.map((id) => {
        const active = !finished && (id === a || id === b);
        const holding = !finished && id === anchor;
        return (
          <span
            key={id}
            ref={(el) => {
              slotRefs.current[id] = el;
            }}
            className={`${HUE_CLASS[id]} relative inline-flex shrink-0`}
          >
            {/* The halo blooms on whoever currently holds the work, so the pass
                is felt on the agent and not only on the pill. */}
            <span
              aria-hidden="true"
              className={`agent-halo pointer-events-none absolute -inset-1.5 rounded-[12px] transition-all duration-500 ${
                holding
                  ? "scale-100 opacity-100"
                  : active
                    ? "scale-95 opacity-45"
                    : "scale-90 opacity-0"
              }`}
            />
            <span
              className={`relative transition-opacity duration-500 ${
                finished ? "opacity-90" : active ? "opacity-100" : "opacity-35"
              }`}
            >
              <Avatar agentId={id} size="md" badge={id !== "user"} />
            </span>
          </span>
        );
      })}

      {/* The work in hand. Opaque under its tint so it occludes the rail
          cleanly as it crosses, the way a card passed across a table would. */}
      {measured && exchange && (
        <div
          aria-hidden="true"
          className={`${HUE_CLASS[atB ? b : a]} pointer-events-none absolute top-1/2 z-10 will-change-transform`}
          style={{
            left: 0,
            transform: `translate3d(${x}px, -50%, 0) ${offset}`,
            transition: `transform ${SHUTTLE_MS}ms cubic-bezier(0.45, 0, 0.35, 1), opacity 400ms ease`,
            opacity: finished ? 0 : 1,
          }}
        >
          <span className="agent-chip flex items-center gap-1.5 whitespace-nowrap rounded-full bg-panel px-2.5 py-1 text-[11px] font-medium shadow-sm">
            <span className="flex items-center gap-[3px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="relay-dot h-[5px] w-[5px] rounded-full bg-current"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </span>
            {exchange.label}
          </span>
        </div>
      )}

      {finished && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center">
          <span className="rounded-full border border-approved-line bg-approved-bg px-3 py-1.5 text-[12px] font-medium text-approved">
            {scenario.outcome}
          </span>
        </div>
      )}
    </div>
  );
}
