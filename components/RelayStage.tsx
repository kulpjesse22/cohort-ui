"use client";

import { useState } from "react";
import { AgentRelay, SCENARIOS } from "./AgentRelay";

/**
 * The interactive wrapper: the viewer picks a request and watches the team run
 * it. Watching an animation is a video with extra steps — causing one is the
 * difference, because the planner handing a decision back only lands if you
 * were the one who asked.
 */
export function RelayStage() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [runs, setRuns] = useState(0);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  return (
    <div className="w-full">
      <AgentRelay key={`${scenario.id}-${runs}`} scenario={scenario} />

      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {SCENARIOS.map((s) => {
          const active = s.id === scenario.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                if (active) setRuns((r) => r + 1);
                else setScenarioId(s.id);
              }}
              className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                active
                  ? "border-line-strong bg-raised text-ink"
                  : "border-line text-ink-3 hover:bg-hover hover:text-ink"
              }`}
            >
              {active ? "↻ " : ""}
              {s.prompt}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-center text-[11px] text-ink-3">
        Pick a request and watch the team run it. Nobody moves until the
        question comes back to you.
      </p>
    </div>
  );
}
