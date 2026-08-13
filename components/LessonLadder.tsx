"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LessonMemory } from "@/lib/lessons";
import { ArtifactLink } from "./ArtifactLink";

/**
 * What the team learned, read live from Agents/lessons/INDEX.md.
 *
 * The harness treats a confirmed failure as something to push *down* a ladder:
 * a conditional lesson should become an always-on gate, and a gate should
 * become a deterministic check and stop being memory at all. Sections are
 * ordered by that force so the direction of travel is visible, and the caps are
 * shown because they are the point — memory that grows without bound is memory
 * nobody carries.
 */

// A lesson that has fired again is a lesson the trigger did not prevent, which
// is the skill's own signal to promote it.
const PROMOTION_PRESSURE = 2;

export function LessonLadder() {
  const [memory, setMemory] = useState<LessonMemory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/lessons")
      .then((r) => r.json())
      .then((json: LessonMemory) => {
        if (!active) return;
        setMemory(json);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LadderSkeleton />;

  if (!memory?.installed) {
    return (
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <EmptyNote title="This project's harness predates the lessons index">
          Nothing is being tracked because{" "}
          <span className="font-mono text-[11px]">Agents/lessons/INDEX.md</span>{" "}
          is not installed here. Run{" "}
          <span className="font-mono text-[11px]">hai-harness update</span> to
          pick up the current memory model.
        </EmptyNote>
      </div>
    );
  }

  const { entries, gates, pending, malformed, lastSwept, limits } = memory;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-5 py-6">
        <p className="max-w-xl text-[13px] leading-relaxed text-ink-2">
          A confirmed failure becomes a rule, and every rule is pushed as far
          toward automation as it will go. What is left over is the smallest set
          of judgment the team has to carry by hand.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3">
          <Stat label="Queued checks" value={pending.length} />
          <Stat label="Standing gates" value={gates.length} max={limits.gates} />
          <Stat label="Conditional lessons" value={entries.length} max={limits.entries} />
          <span className="ml-auto text-[11px] text-ink-3">
            {lastSwept ? `Last swept ${lastSwept}` : "Never swept"}
          </span>
        </div>

        <Section
          tier="Tier 0"
          name="Becoming code"
          blurb="Queued for a deterministic check. When the check lands, the memory is deleted — the check is the memory."
        >
          {pending.length === 0 ? (
            <EmptyNote title="Nothing queued for mechanization">
              No rule here is currently reducible to an automated check.
            </EmptyNote>
          ) : (
            pending.map((check) => (
              <Row key={check.text}>
                <p className="text-[13px] leading-relaxed text-ink">{check.text}</p>
                {check.source && <Meta>from {check.source}</Meta>}
              </Row>
            ))
          )}
        </Section>

        <Section
          tier="Tier 1"
          name="Always on"
          blurb={`Unconditional rules, loaded with project context on every turn. Capped at ${limits.gates} — a new one has to displace an old one.`}
        >
          {gates.length === 0 ? (
            <EmptyNote title="No standing gates yet">
              Nothing has been promoted to an unconditional rule.
            </EmptyNote>
          ) : (
            gates.map((gate) => (
              <Row key={gate.text}>
                <p className="text-[13px] leading-relaxed text-ink">{gate.text}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <ArtifactLink path={memory.contextPath} />
                  {gate.source && <Meta>from {gate.source}</Meta>}
                </div>
              </Row>
            ))
          )}
        </Section>

        <Section
          tier="Tier 2"
          name="Conditional"
          blurb={`Judgment that applies only under a named trigger. Capped at ${limits.entries}; only trigger-matching lessons are routed into a worker's contract.`}
        >
          {entries.length === 0 ? (
            <EmptyNote title="No conditional lessons yet">
              Nothing has needed a lesson that only applies sometimes.
            </EmptyNote>
          ) : (
            entries.map((entry) => (
              <Row key={entry.file}>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                      entry.kind === "never"
                        ? "border-revise-line bg-revise-bg text-revise"
                        : "border-line-strong text-ink-3"
                    }`}
                  >
                    {entry.kind}
                  </span>
                  <p className="min-w-0 text-[11px] leading-relaxed text-ink-3">
                    when {entry.trigger}
                  </p>
                </div>

                <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
                  {entry.imperative}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <ArtifactLink path={entry.path} />
                  {entry.source && <Meta>from {entry.source}</Meta>}
                  <Meta>
                    fired {entry.fired}
                    {entry.fired === 1 ? " time" : " times"}
                  </Meta>
                  {entry.fired >= PROMOTION_PRESSURE && (
                    <span className="rounded border border-fixes-line bg-fixes-bg px-1.5 py-0.5 text-[10px] text-fixes">
                      promotion candidate
                    </span>
                  )}
                  {entry.broken && (
                    <span className="rounded border border-revise-line bg-revise-bg px-1.5 py-0.5 text-[10px] text-revise">
                      lesson file missing
                    </span>
                  )}
                </div>
              </Row>
            ))
          )}
        </Section>

        {malformed.length > 0 && (
          <Section
            tier="Unparsed"
            name="Not in the index grammar"
            blurb="These lines are in the index but do not match its entry format, so the UI cannot route them. Shown rather than dropped."
          >
            {malformed.map((line) => (
              <Row key={line}>
                <p className="font-mono text-[11px] leading-relaxed text-ink-2">{line}</p>
              </Row>
            ))}
          </Section>
        )}

        <p className="mt-8 text-[11px] text-ink-3">
          Read live from <ArtifactLink path={memory.indexPath} />. Only Claudia
          writes it, and only through the{" "}
          <span className="font-mono text-[11px]">lesson-logger</span> skill.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, max }: { label: string; value: number; max?: number }) {
  // Amber near the cap, rose at it: the caps only mean something if you can see
  // yourself approaching one.
  const tone =
    max === undefined || value < max * 0.8
      ? "text-ink"
      : value < max
        ? "text-fixes"
        : "text-revise";

  return (
    <span className="flex items-baseline gap-1.5">
      <span className={`text-[15px] font-semibold tabular-nums ${tone}`}>
        {value}
        {max !== undefined && (
          <span className="text-[11px] font-normal text-ink-4"> / {max}</span>
        )}
      </span>
      <span className="text-[11px] text-ink-3">{label}</span>
    </span>
  );
}

function Section({
  tier,
  name,
  blurb,
  children,
}: {
  tier: string;
  name: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-7">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-4">
          {tier}
        </span>
        <h2 className="text-[13px] font-semibold text-ink">{name}</h2>
      </div>
      <p className="mt-0.5 max-w-xl text-[11px] leading-relaxed text-ink-3">{blurb}</p>
      <div className="mt-2.5 space-y-2">{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-3.5 py-3">{children}</div>
  );
}

function Meta({ children }: { children: ReactNode }) {
  return <span className="text-[10px] text-ink-4">{children}</span>;
}

function EmptyNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-3.5 py-3">
      <p className="text-[13px] font-medium text-ink-2">{title}</p>
      <p className="mt-1 max-w-md text-[11px] leading-relaxed text-ink-3">{children}</p>
    </div>
  );
}

function LadderSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-5 py-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-3 w-40 rounded bg-raised" />
            <div className="h-16 rounded-lg bg-raised" />
          </div>
        ))}
      </div>
    </div>
  );
}
