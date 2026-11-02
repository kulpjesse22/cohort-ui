"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getParticipant, isAgent, type ActorId } from "@/lib/agents";
import {
  SEEDED_HANDOFFS,
  YOU,
  formatAge,
  formatAgo,
  lineCounts,
  resolveHandoffs,
  type ResolvedHandoff,
  type ReviewGroup,
  type ReviewHandoff,
  type ReviewStep,
} from "@/lib/reviews";
import { ARCHIVE_OPTIONS, STALE_STATUS_OPTIONS, labelOf } from "@/lib/settings";
import { useReviewSettings } from "@/lib/useReviewSettings";
import { AppShell } from "./AppShell";
import { ArtifactLink } from "./ArtifactLink";
import { Avatar } from "./Avatar";
import { DiffPanel } from "./DiffPanel";
import { ArrowLeftIcon, BranchIcon, ChevronDownIcon, ChevronRightIcon } from "./Icons";
import { HandoffMark, KindMark, ProvenanceTag, handoffTone, type HandoffMarkKind } from "./Marks";
import { ShareMenu } from "./ShareMenu";

const REPO = "https://github.com/kulpjesse22/cohort-ui/blob/main/";
const NOT_ON_MAIN = new Set(["Agents/designs/verdict-marks.md"]);

const TABS = [
  { id: "activity", label: "Activity" },
  { id: "guide", label: "Guide" },
  { id: "diff", label: "Diff" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function nameOf(id: ActorId, fallback?: string): string {
  if (id === YOU) return "You";
  return getParticipant(id)?.name ?? fallback ?? id;
}

/** Roster members get their crew bust; Claude and Codex, who are not on the roster, get a plain tile. */
function ActorAvatar({ id, name }: { id: ActorId; name?: string }) {
  if (getParticipant(id)) return <Avatar agentId={id === YOU ? "user" : id} size="sm" />;
  const label = name ?? id;
  return (
    <span className="relative inline-flex shrink-0" title={`${label}, an agent outside the roster`}>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] bg-raised text-[9px] font-semibold text-ink-2 ring-1 ring-inset ring-line-strong">
        {label.slice(0, 2).toUpperCase()}
      </span>
      <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 rounded-full bg-canvas p-[1.5px]">
        <span className="block h-1.5 w-1.5 rounded-full ring-1 ring-inset ring-ink-3" />
      </span>
    </span>
  );
}

function statusOf(h: ResolvedHandoff): { mark: HandoffMarkKind; text: string } {
  switch (h.status.kind) {
    case "waiting":
      return { mark: "waiting", text: h.status.live ? "Decision needed from you" : "Waiting for your review" };
    case "reviewing":
      return { mark: "reviewing", text: "In review" };
    case "revising":
      return { mark: "revising", text: `Revise · back with ${nameOf(h.author, h.authorName)}` };
    case "verdict":
      return {
        mark: h.status.verdict === "Approved" ? "approved" : h.status.verdict === "Revise" ? "revising" : "fixes",
        text: h.status.verdict,
      };
    case "filed":
      return { mark: "filed", text: "Filed" };
    case "stale":
      return { mark: h.status.as, text: labelOf(STALE_STATUS_OPTIONS, h.status.as) };
  }
}

/** Backticks become mono and bold stays bold, so a live note reads as written. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") ? (
          <code key={i} className="font-mono text-[0.92em] text-ink">
            {p.slice(1, -1)}
          </code>
        ) : p.startsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {p.slice(2, -2)}
          </strong>
        ) : (
          p
        )
      )}
    </>
  );
}

function promptFor(h: ResolvedHandoff): string {
  const { added, removed } = lineCounts(h.files);
  const files = h.files.length
    ? h.files.map((f) => `- ${f.path} (+${lineCounts([f]).added} −${lineCounts([f]).removed})`)
    : (h.namedFiles ?? []).map((f) => `- ${f}`);
  return [
    `Review this handoff in the Cohort repo (kulpjesse22/cohort-ui).`,
    ``,
    `Title: ${h.title}`,
    `From: ${nameOf(h.author, h.authorName)}${h.branch ? ` · branch ${h.branch}` : ""}${
      h.files.length ? ` · +${added} −${removed}` : ""
    }`,
    h.source ? `Handoff note: ${h.source}` : null,
    ``,
    `What changed`,
    h.guide.summary,
    ...h.guide.changed.map((c) => `- ${c}`),
    files.length ? `` : null,
    files.length ? `Files` : null,
    ...files,
    h.guide.check.length ? `` : null,
    h.guide.check.length ? `What to check` : null,
    ...h.guide.check.map((c) => `- ${c}`),
    ``,
    `Reply with a verdict (Approved, Approved with fixes, or Revise) and list each fix specifically, assigned to the author.`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

function hrefFor(id: string, tab?: Tab) {
  return `/reviews/${encodeURIComponent(id)}${tab ? `?tab=${tab}` : ""}`;
}

function isPlainClick(e: React.MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

// --- The list -----------------------------------------------------------------

function Row({
  h,
  selected,
  onOpen,
}: {
  h: ResolvedHandoff;
  selected: boolean;
  onOpen: (e: React.MouseEvent, id: string) => void;
}) {
  const s = statusOf(h);
  const age = h.closedMinutesAgo ?? h.ageMinutes;
  return (
    <li>
      <Link
        href={hrefFor(h.id)}
        scroll={false}
        data-review-row
        onClick={(e) => onOpen(e, h.id)}
        aria-current={selected ? "page" : undefined}
        className="aff flex min-h-[3.25rem] items-center gap-3 rounded-md px-2.5 py-2"
      >
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-body ${selected ? "font-semibold text-ink" : "text-ink"}`}>{h.title}</span>
          <span className={`mt-0.5 flex items-center gap-1.5 text-meta ${handoffTone(s.mark)}`}>
            <HandoffMark kind={s.mark} />
            <span className="truncate">{s.text}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <ActorAvatar id={h.author} name={h.authorName} />
          <span className="w-7 text-right text-meta tabular-nums text-ink-3">
            <span className="sr-only">{h.closedMinutesAgo !== undefined ? "Closed " : "Filed "}</span>
            {formatAge(age)}
            <span className="sr-only"> ago</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

function Group({
  label,
  items,
  open,
  onToggle,
  selectedId,
  onOpen,
  empty,
}: {
  label: string;
  items: ResolvedHandoff[];
  open: boolean;
  onToggle: () => void;
  selectedId: string | null;
  onOpen: (e: React.MouseEvent, id: string) => void;
  empty: string;
}) {
  const id = `group-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <section className="mb-2">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="aff flex min-h-8 w-full items-center gap-1.5 rounded-md px-2 text-left text-meta font-semibold text-ink-2 hover:text-ink"
        >
          <span className="text-ink-3">{open ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}</span>
          {label}
          <span className="font-normal tabular-nums text-ink-3">{items.length}</span>
        </button>
      </h3>
      {open && (
        <div id={id}>
          {items.length === 0 ? (
            <p className="px-2.5 py-2 text-meta text-ink-3">{empty}</p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((h) => (
                <Row key={h.id} h={h} selected={h.id === selectedId} onOpen={onOpen} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

// --- The tabs -----------------------------------------------------------------

function StepMark({ step }: { step: ReviewStep }) {
  switch (step.kind) {
    case "handoff":
      return <KindMark kind="brief" />;
    case "change":
      return <KindMark kind="task" />;
    case "review":
      return <KindMark kind="review" />;
    case "decision":
      return <KindMark kind="decision" />;
    case "close":
      return <HandoffMark kind="closed" />;
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0 text-ink-3">
          <circle cx="6" cy="6" r="1.8" fill="currentColor" />
        </svg>
      );
  }
}

function PathRef({ path }: { path: string }) {
  if (path.endsWith(".md")) return <ArtifactLink path={path} />;
  return <span className="font-mono text-label text-ink-3">{path}</span>;
}

function Fixes({ h }: { h: ResolvedHandoff }) {
  if (!h.fixes?.length) return null;
  return (
    <div className="mt-2">
      <p className="text-meta text-ink-3">Fixes assigned back to {nameOf(h.author, h.authorName)}</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-body text-ink-2">
        {h.fixes.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ol>
    </div>
  );
}

function ActivityTab({ h }: { h: ResolvedHandoff }) {
  const steps: (ReviewStep & { fixes?: boolean })[] = [...h.activity];
  if (h.reviewer === null) {
    steps.push({
      minutesAgo: h.ageMinutes - 0.5,
      actor: YOU,
      kind: "read",
      text: `Routed to ${nameOf(h.reviewerId)} by your default reviewer setting.`,
    });
  }
  if (h.status.kind === "stale") {
    steps.push({
      minutesAgo: h.closedMinutesAgo ?? 0,
      actor: YOU,
      kind: "close",
      text: `${labelOf(STALE_STATUS_OPTIONS, h.status.as)} by your settings, in this browser only. The record is unchanged.`,
    });
  }
  steps.sort((a, b) => b.minutesAgo - a.minutesAgo);
  const lastReview = steps.map((s) => s.kind).lastIndexOf("review");

  return (
    <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[5.5px] before:top-2 before:w-px before:bg-line">
      {steps.map((step, i) => (
        <li key={i} className="relative flex gap-3">
          <span className="relative mt-[5px] flex h-3 w-3 shrink-0 items-center justify-center bg-canvas">
            {step.kind === "close" ? (
              <HandoffMark kind={h.status.kind === "stale" ? h.status.as : "closed"} className="h-3 w-3 text-ink-3" />
            ) : (
              <StepMark step={step} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body text-ink-2">
              <span className="font-semibold text-ink">{nameOf(step.actor, step.actorName)}</span> {step.text}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-meta tabular-nums text-ink-3">{formatAgo(step.minutesAgo)}</span>
              {step.path && <PathRef path={step.path} />}
            </div>
            {i === lastReview && <Fixes h={h} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h3 className="border-b border-line pb-2 text-label font-semibold uppercase tracking-[0.06em] text-ink-3">{label}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-body text-ink-2">
            <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink-3" />
            <span className="min-w-0">
              <Inline text={item} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GuideTab({ h }: { h: ResolvedHandoff }) {
  if (h.provenance === "live") {
    const shown = (h.sections ?? []).filter((s) => !/^files/i.test(s.heading));
    return (
      <div className="max-w-2xl">
        <p className="text-body text-ink">{h.guide.summary}</p>
        {h.source && (
          <div className="mt-2">
            <ArtifactLink path={h.source} />
          </div>
        )}
        {shown.map((s) => (
          <ListBlock key={s.heading} label={s.heading} items={s.items} />
        ))}
      </div>
    );
  }
  return (
    <div className="max-w-2xl">
      <p className="text-body text-ink">{h.guide.summary}</p>
      {h.fixes?.length ? (
        <section className="mt-6">
          <Fixes h={h} />
        </section>
      ) : null}
      <ListBlock label="What changed" items={h.guide.changed} />
      <ListBlock label="What to check" items={h.guide.check} />
      <ListBlock label="Left alone" items={h.guide.untouched ?? []} />
    </div>
  );
}

function DiffTab({ h }: { h: ResolvedHandoff }) {
  if (h.files.length === 0) {
    return (
      <div className="max-w-2xl">
        <p className="text-body text-ink-3">
          No diff. A handoff note records the baton pass, not the patch, so there are no lines to show. These are the
          files it names.
        </p>
        {h.namedFiles?.length ? (
          <ul className="mt-4 space-y-1.5">
            {h.namedFiles.map((f) => (
              <li key={f}>
                <PathRef path={f} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {h.files.map((f) => (
        <DiffPanel key={f.path} file={f} />
      ))}
    </div>
  );
}

// --- The view -----------------------------------------------------------------

export function ReviewsView({ live }: { live: ReviewHandoff[] }) {
  const { settings } = useReviewSettings();
  const pathname = usePathname() ?? "/reviews";
  const params = useSearchParams();
  const [collapsed, setCollapsed] = useState<Partial<Record<ReviewGroup, boolean>>>({});

  const all = useMemo(() => resolveHandoffs([...SEEDED_HANDOFFS, ...live], settings), [live, settings]);
  const by = useMemo(() => {
    const pick = (g: ReviewGroup) => all.filter((h) => h.group === g);
    return {
      needs: pick("needs").sort((a, b) => a.ageMinutes - b.ageMinutes),
      reviewing: pick("reviewing").sort((a, b) => a.ageMinutes - b.ageMinutes),
      completed: pick("completed").sort((a, b) => (a.closedMinutesAgo ?? 0) - (b.closedMinutesAgo ?? 0)),
      elsewhere: pick("elsewhere"),
      archived: pick("archived"),
    };
  }, [all]);

  const routeId = pathname.startsWith("/reviews/") ? decodeURIComponent(pathname.slice("/reviews/".length)) : null;
  const selected =
    (routeId ? all.find((h) => h.id === routeId) : null) ??
    (routeId ? null : (by.needs[0] ?? by.reviewing[0] ?? by.completed[0] ?? null));

  const requested = params.get("tab");
  const tab: Tab =
    requested === "activity" || requested === "guide" || requested === "diff"
      ? requested
      : selected?.files.length
        ? "diff"
        : "guide";

  const isOpen = (g: ReviewGroup) => {
    if (collapsed[g] !== undefined) return !collapsed[g];
    if (g === "completed") return selected?.group === "completed";
    return true;
  };
  const toggle = (g: ReviewGroup) => setCollapsed((c) => ({ ...c, [g]: isOpen(g) }));

  function open(e: React.MouseEvent, id: string) {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    window.history.pushState(null, "", hrefFor(id));
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      requestAnimationFrame(() => document.getElementById("review-title")?.focus());
    }
  }

  function back(e: React.MouseEvent) {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    window.history.pushState(null, "", "/reviews");
  }

  function chooseTab(next: Tab) {
    if (!selected) return;
    window.history.replaceState(null, "", hrefFor(selected.id, next));
  }

  function onTabKey(e: React.KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    chooseTab(TABS[next].id);
    requestAnimationFrame(() => document.getElementById(`tab-${TABS[next].id}`)?.focus());
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const rows = [...(e.currentTarget.querySelectorAll<HTMLElement>("[data-review-row]") ?? [])];
    const at = rows.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    e.preventDefault();
    rows[e.key === "ArrowDown" ? Math.min(at + 1, rows.length - 1) : Math.max(at - 1, 0)]?.focus();
  }

  const liveCount = live.length;
  const elsewhereBy = [...new Set(by.elsewhere.map((h) => nameOf(h.reviewerId)))];

  const header = (
    <div className="min-w-0">
      <h1 className="truncate text-heading font-semibold text-ink">Reviews</h1>
      <p className="truncate text-meta text-ink-3">Work agents have handed to a person, and what became of it.</p>
    </div>
  );

  const list = (
    <aside
      aria-label="Handoffs"
      className={`min-h-0 w-full shrink-0 flex-col overflow-y-auto border-line lg:flex lg:w-[21rem] lg:border-r ${
        routeId ? "hidden" : "flex"
      }`}
    >
      <div className="px-4 pb-2 pt-4">
        <ProvenanceTag
          kind="seeded"
          title="The seeded handoffs show the shape, with diffs. Notes from Agents/handoffs/ are read off disk on each request."
        >
          Seeded, plus {liveCount} {liveCount === 1 ? "note" : "notes"} read live
        </ProvenanceTag>
      </div>
      <div className="px-2 pb-6" onKeyDown={onListKey}>
        <Group
          label="Needs your review"
          items={by.needs}
          open={isOpen("needs")}
          onToggle={() => toggle("needs")}
          selectedId={selected?.id ?? null}
          onOpen={open}
          empty="Nothing is waiting on you."
        />
        <Group
          label="You’re reviewing"
          items={by.reviewing}
          open={isOpen("reviewing")}
          onToggle={() => toggle("reviewing")}
          selectedId={selected?.id ?? null}
          onOpen={open}
          empty="No review in progress."
        />
        <Group
          label="Completed"
          items={by.completed}
          open={isOpen("completed")}
          onToggle={() => toggle("completed")}
          selectedId={selected?.id ?? null}
          onOpen={open}
          empty="Nothing completed yet."
        />

        {(by.elsewhere.length > 0 || by.archived.length > 0) && (
          <div className="mt-3 space-y-1.5 border-t border-line px-2.5 pt-3 text-meta text-ink-3">
            {by.elsewhere.length > 0 && (
              <p>
                {by.elsewhere.length} more routed to {elsewhereBy.join(" and ")} by your default reviewer.
              </p>
            )}
            {by.archived.length > 0 && (
              <p>
                {by.archived.length} archived after{" "}
{labelOf(ARCHIVE_OPTIONS, settings.archiveAfter).toLowerCase()}.
              </p>
            )}
            <Link
              href="/settings"
              className="inline-block text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink-3"
            >
              Change in settings
            </Link>
          </div>
        )}
      </div>
    </aside>
  );

  let detail: ReactNode;
  if (!selected) {
    detail = (
      <div className="flex-1 px-4 py-10 lg:px-6">
        <p className="text-body text-ink-3">
          {routeId ? "No handoff by that name. It may have been renamed." : "Nothing has been handed to you yet."}
        </p>
        <Link href="/reviews" onClick={back} className="mt-2 inline-block text-meta text-ink-2 underline decoration-line-strong underline-offset-4">
          All reviews
        </Link>
      </div>
    );
  } else {
    const { added, removed } = lineCounts(selected.files);
    const fileUrl =
      selected.source
        ? REPO + selected.source
        : selected.files[0] && !NOT_ON_MAIN.has(selected.files[0].path)
          ? REPO + selected.files[0].path
          : null;
    detail = (
      <>
        <div className="border-b border-line px-4 pt-3 lg:px-6">
          <div className="flex min-h-8 items-center gap-2">
            <Link
              href="/reviews"
              onClick={back}
              className="aff -ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-1.5 text-meta text-ink-2 hover:text-ink lg:hidden"
            >
              <ArrowLeftIcon />
              All reviews
            </Link>
            <span className="hidden min-w-0 flex-1 lg:block">
              {selected.provenance === "live" ? (
                <ProvenanceTag kind="live" title="Read off disk on this request">
                  Read live from <span className="font-mono text-ink-2">{selected.source}</span>
                </ProvenanceTag>
              ) : (
                <ProvenanceTag kind="seeded" title="Written to show the shape. No agent produced this diff.">
                  Seeded handoff
                </ProvenanceTag>
              )}
            </span>
            <span className="flex-1 lg:hidden" />
            <ShareMenu
              key={selected.id}
              link={hrefFor(selected.id, tab)}
              branch={selected.branch}
              prompt={promptFor(selected)}
              fileUrl={fileUrl}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-ink-3">
            <span className="flex items-center gap-1.5">
              <ActorAvatar id={selected.author} name={selected.authorName} />
              {isAgent(selected.author) ? (
                <Link href={`/agent/${selected.author}`} className="font-semibold text-ink hover:underline">
                  {nameOf(selected.author)}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{nameOf(selected.author, selected.authorName)}</span>
              )}
              <span aria-hidden="true">→</span>
              <span className="sr-only">handed to</span>
              <span>{nameOf(selected.reviewerId)}</span>
            </span>
            {selected.branch && (
              <span className="flex min-w-0 items-center gap-1">
                <BranchIcon className="h-3.5 w-3.5" />
                <span className="truncate font-mono text-label">{selected.branch}</span>
              </span>
            )}
            {selected.files.length > 0 && (
              <span className="font-mono text-label tabular-nums">
                <span className="diff-add-ink">+{added}</span> <span className="diff-del-ink">−{removed}</span>
                <span className="sr-only"> lines</span>
              </span>
            )}
            <span className={`flex items-center gap-1.5 ${handoffTone(statusOf(selected).mark)}`}>
              <HandoffMark kind={statusOf(selected).mark} />
              {statusOf(selected).text}
            </span>
          </div>

          <h2
            id="review-title"
            tabIndex={-1}
            className="mt-3 font-display text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.025em] text-ink outline-none sm:text-title"
          >
            {selected.title}
          </h2>

          <div className="mt-2 lg:hidden">
            {selected.provenance === "live" ? (
              <ProvenanceTag kind="live" title={`Read off disk on this request: ${selected.source}`}>
                Read live from <span className="font-mono text-ink-2">{selected.source?.split("/").pop()}</span>
              </ProvenanceTag>
            ) : (
              <ProvenanceTag kind="seeded" title="Written to show the shape. No agent produced this diff.">
                Seeded handoff
              </ProvenanceTag>
            )}
          </div>

          <div role="tablist" aria-label="Handoff" onKeyDown={onTabKey} className="-mx-2 mt-3 flex gap-1 pb-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls="review-panel"
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => chooseTab(t.id)}
                className={`chip flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-meta ${
                  tab === t.id ? "font-semibold text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {t.label}
                {t.id === "diff" && selected.files.length > 0 && (
                  <span className="font-normal tabular-nums text-ink-3">{selected.files.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          id="review-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          tabIndex={0}
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-16 pt-6 outline-none focus-visible:shadow-[inset_0_0_0_1.5px_var(--aff-focus)] lg:px-6"
        >
          {tab === "activity" && <ActivityTab h={selected} />}
          {tab === "guide" && <GuideTab h={selected} />}
          {tab === "diff" && <DiffTab h={selected} />}
        </div>
      </>
    );
  }

  return (
    <AppShell activeChannelId={null} header={header} rail={false}>
      <div className="flex min-h-0 flex-1">
        {list}
        <section
          aria-label={selected ? selected.title : "Handoff"}
          className={`min-w-0 flex-1 flex-col lg:flex ${routeId ? "flex" : "hidden"}`}
        >
          {detail}
        </section>
      </div>
    </AppShell>
  );
}
