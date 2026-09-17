import Image from "next/image";
import Link from "next/link";
import { AGENT_ORDER, AGENTS } from "@/lib/agents";
import { Avatar } from "./Avatar";
import { LeadHandoffIndicator } from "./LeadHandoffIndicator";

export function WelcomeScreen() {
  return (
    <main className="min-h-[100dvh] bg-canvas text-ink">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex shrink-0 items-center justify-between gap-4 py-2">
          <Image
            src="/cohort-wordmark-transparent.png"
            alt="Cohort"
            width={1550}
            height={440}
            unoptimized
            priority
            className="h-auto w-28"
          />
          <nav className="flex items-center gap-2">
            <Link
              href="/timeline"
              className="hidden min-h-9 items-center rounded-md border border-line-strong px-3 text-[13px] text-ink-2 transition-colors hover:bg-hover hover:text-ink sm:flex"
            >
              Project record
            </Link>
            <Link
              href="/demo"
              className="flex min-h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-[13px] font-semibold text-brand-ink transition-opacity hover:opacity-90"
            >
              <span aria-hidden="true">▶</span>
              Guided tour
            </Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:py-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">
              A workspace for people and agents
            </p>
            <h1 className="mt-2 max-w-lg text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[40px]">
              Direct the team. Trust the handoff.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-ink-2">
              Cohort makes roles, decisions, handoffs, reviews, and lessons
              visible, with the repository as the record behind the work.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Link
                href="/cohort"
                className="flex min-h-10 items-center rounded-md bg-control px-4 text-sm font-semibold text-control-ink transition-opacity hover:opacity-90"
              >
                Open Cohort
              </Link>
              <Link
                href="/timeline"
                className="flex min-h-10 items-center rounded-md border border-line-strong px-4 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink"
              >
                View timeline
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-panel lg:min-h-[540px]">
            <div className="grid lg:h-full lg:min-h-[540px] lg:grid-cols-[190px_minmax(0,1fr)_230px]">
              <aside className="sidebar-scope hidden border-r border-sidebar-line bg-sidebar p-3 text-sidebar-ink lg:block">
                <Image
                  src="/cohort-wordmark-transparent.png"
                  alt="Cohort"
                  width={1550}
                  height={440}
                  unoptimized
                  className="h-auto w-24"
                />
                <p className="mt-1 text-[11px] leading-4 text-sidebar-ink-3">
                  Same rules, shared record.
                </p>

                <div className="mt-5 text-[10px] font-medium uppercase tracking-[0.06em] text-sidebar-ink-3">
                  Channels
                </div>
                <div className="mt-1 space-y-0.5">
                  {["cohort", "claudia", "design-crit"].map((channel, i) => (
                    <div
                      key={channel}
                      className={`rounded-md px-2 py-1.5 text-[13px] ${
                        i === 0
                          ? "bg-sidebar-active text-sidebar-ink"
                          : "text-sidebar-ink-2"
                      }`}
                    >
                      # {channel}
                    </div>
                  ))}
                </div>

                <div className="mt-5 text-[10px] font-medium uppercase tracking-[0.06em] text-sidebar-ink-3">
                  Registry
                </div>
                <div className="mt-2 space-y-2">
                  {AGENT_ORDER.slice(0, 4).map((id) => (
                    <div key={id} className="flex items-center gap-2">
                      <Avatar agentId={id} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] text-sidebar-ink">
                          {AGENTS[id].name}
                        </span>
                        <span className="block truncate text-[10px] text-sidebar-ink-3">
                          {AGENTS[id].seniority}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="flex min-w-0 flex-col bg-canvas">
                <div className="border-b border-line px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar agentId="claudia" size="sm" />
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em]">
                        #cohort
                      </h2>
                      <p className="truncate text-[11px] text-ink-3">
                        Lead-routed team workspace
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-line px-4 py-5">
                  <LeadHandoffIndicator label="Checking scope..." />
                </div>

                <div className="flex-1 space-y-4 px-4 py-5">
                  <PreviewMessage
                    agentId="claudia"
                    name="Claudia"
                    meta="Lead · 9:41 AM"
                    text="I’ll split this into a plan, a build pass, and an adversarial review before anything gets called done."
                  />
                  <PreviewMessage
                    agentId="augustus"
                    name="Augustus"
                    meta="Builder · 9:46 AM"
                    text="Taking the workspace shell. I’ll post the diff and route the review back through Athena."
                  />
                  <PreviewDecision />
                </div>
              </div>

              <aside className="hidden border-l border-line bg-panel p-4 lg:block">
                <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
                  Context
                </div>
                <div className="mt-3 space-y-3">
                  <ContextItem label="Current source" value="repo / Human / Agents" />
                  <ContextItem label="Routing" value="Planner approves dependency graph" />
                  <ContextItem label="Review" value="Evaluator tries to break output" />
                  <ContextItem label="Memory" value="Lessons written back to record" />
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PreviewMessage({
  agentId,
  name,
  meta,
  text,
}: {
  agentId: keyof typeof AGENTS;
  name: string;
  meta: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <Avatar agentId={agentId} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
            {name}
          </span>
          <span className="text-[11px] text-ink-4">{meta}</span>
        </div>
        <p className="mt-0.5 text-[14px] leading-[1.62] text-ink-2">{text}</p>
      </div>
    </div>
  );
}

function PreviewDecision() {
  return (
    <div className="rounded-md border border-line bg-raised px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
          Decision logged
        </span>
        <span className="font-mono text-[10px] text-ink-4">decisions.md</span>
      </div>
      <p className="mt-1 text-[13px] leading-5 text-ink-2">
        Lead owns routing. Workers own execution. Review ships only after fixes
        are written back.
      </p>
    </div>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line pb-3 last:border-b-0">
      <div className="text-[11px] text-ink-3">{label}</div>
      <div className="mt-1 text-[13px] leading-5 text-ink-2">{value}</div>
    </div>
  );
}
