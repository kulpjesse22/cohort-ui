"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LessonMemory } from "@/lib/lessons";
import { ArtifactLink } from "./ArtifactLink";
import { ProvenanceTag } from "./Marks";

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
      <div className="flex-1 overflow-y-auto px-4 pt-8 lg:px-6 lg:pt-12">
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
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 lg:px-6 lg:pt-12">
        <h2 className="max-w-xl font-display text-title font-semibold text-ink">
          Memory that gets smaller.{" "}
          <span className="text-ink-3">
            Failures become rules, and rules become checks.
          </span>
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          <ProvenanceTag kind="live" title={`Read on this request from ${memory.indexPath}`}>
            Read live from the repo
          </ProvenanceTag>
          <span className="text-meta tabular-nums text-ink-3">
            {lastSwept ? `Last swept ${lastSwept}` : "Never swept"}
          </span>
        </div>

        {/* The caps are the point, so the three counts lead the page, each
            against its cap. */}
        <dl className="mt-10 grid grid-cols-3 gap-x-6 border-y border-line">
          <Stat label="Becoming code" value={pending.length} />
          <Stat label="Always on" value={gates.length} max={limits.gates} />
          <Stat label="Conditional" value={entries.length} max={limits.entries} />
        </dl>

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
                <p className="text-body text-ink">{check.text}</p>
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
                <p className="text-body text-ink">{gate.text}</p>
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
                {/* The kind is one word. It earns colour, because a prohibition
                    is not the same as a preference — but it does not earn a box. */}
                <p className="text-meta text-ink-3">
                  <span
                    className={`text-label font-semibold uppercase ${
                      entry.kind === "never" ? "text-revise" : "text-ink-3"
                    }`}
                  >
                    {entry.kind}
                  </span>
                  <span> · </span>
                  when {entry.trigger}
                </p>

                <p className="mt-1 text-body text-ink">
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
                    <span className="text-meta font-semibold text-fixes">
                      ↑ promotion candidate
                    </span>
                  )}
                  {entry.broken && (
                    <span className="text-meta font-semibold text-revise">
                      ✕ lesson file missing
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

        <p className="mt-12 text-meta text-ink-3">
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
  // yourself approaching one. The word under the figure says the same thing,
  // so the hue is never the only signal.
  const near = max !== undefined && value >= max * 0.8;
  const at = max !== undefined && value >= max;
  const tone = at ? "text-revise" : near ? "text-fixes" : "text-ink";

  return (
    <div className="py-4">
      <dt className="text-meta text-ink-3">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-1">
        <span className={`font-display text-figure font-semibold tabular-nums ${tone}`}>{value}</span>
        {max !== undefined && (
          <span className="text-meta tabular-nums text-ink-3">of {max}</span>
        )}
      </dd>
      {(near || at) && (
        <dd className={`mt-1 text-meta font-semibold ${tone}`}>{at ? "At the cap" : "Near the cap"}</dd>
      )}
    </div>
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
    // Space, not enclosure, is what separates one tier from the next. The
    // generous top margin is the only thing marking the boundary, and it is
    // enough.
    <section className="mt-14">
      <div className="flex items-baseline gap-2.5 border-b border-line pb-2">
        <h2 className="text-heading font-semibold text-ink">{name}</h2>
        <span className="text-label font-semibold uppercase text-ink-3">{tier}</span>
      </div>
      <p className="mt-2 max-w-xl text-meta text-ink-3">{blurb}</p>
      <div className="mt-2 divide-y divide-line">{children}</div>
    </section>
  );
}

/**
 * No card. A rule is a line of text, and a box around each one turns a short
 * list into a stack of containers competing with the words inside them. The
 * hairline between rows comes from the parent's divide, so the last row does
 * not end in a dangling edge.
 */
function Row({ children }: { children: ReactNode }) {
  return <div className="py-4 last:pb-0">{children}</div>;
}

function Meta({ children }: { children: ReactNode }) {
  return <span className="text-meta text-ink-3">{children}</span>;
}

function EmptyNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-4">
      <p className="text-body font-semibold text-ink-2">{title}</p>
      <p className="mt-0.5 max-w-md text-meta text-ink-3">{children}</p>
    </div>
  );
}

function LadderSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-8 lg:px-6 lg:pt-12">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-3 w-40 rounded bg-raised" />
            <div className="h-3 w-full rounded bg-raised" />
            <div className="h-3 w-2/3 rounded bg-raised" />
          </div>
        ))}
      </div>
    </div>
  );
}
