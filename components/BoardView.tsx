"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AGENT_ORDER, AGENTS, getParticipant, isAgent, type ActorId } from "@/lib/agents";
import {
  BOARD_STATES,
  COLUMN_OPTIONS,
  FACTORY_DISPLAY,
  ORDER_OPTIONS,
  PRIORITIES,
  PRIORITY_LABEL,
  PROJECTS,
  PROPERTY_OPTIONS,
  ROW_OPTIONS,
  SEEDED_CONVERSATIONS,
  STATE_LABEL,
  fromHandoffs,
  isCompleted,
  parseDisplay,
  sameDisplay,
  sortConversations,
  type BoardDisplay,
  type Conversation,
  type Property,
} from "@/lib/board";
import { SEEDED_HANDOFFS, YOU, formatAge, resolveHandoffs, type ReviewHandoff } from "@/lib/reviews";
import { parseFlags, useLocalState } from "@/lib/useLocalState";
import { useReviewSettings } from "@/lib/useReviewSettings";
import { ActorAvatar } from "./ActorAvatar";
import { AppShell } from "./AppShell";
import { Select, Switch } from "./Controls";
import { BoardIcon, ChevronDownIcon, ChevronRightIcon, CloseIcon, ListIcon, PlusIcon, SettingsIcon } from "./Icons";
import { BoardStateMark, PriorityMark, ProvenanceMark, ProvenanceTag } from "./Marks";

const DISPLAY_KEY = "cohort-board-display";
const DEFAULT_KEY = "cohort-board-default";
const LANES_KEY = "cohort-board-lanes";
const NO_FLAGS: Record<string, boolean> = {};

/** null means "follow the saved default", so Set default carries over to a fresh view. */
function parseMaybeDisplay(raw: unknown): BoardDisplay | null {
  return raw === null ? null : parseDisplay(raw);
}

function nameOf(id: ActorId, fallback?: string): string {
  if (id === YOU) return "You";
  return getParticipant(id)?.name ?? fallback ?? id;
}

function hrefOf(c: Conversation): string {
  return c.reviewId ? `/reviews/${encodeURIComponent(c.reviewId)}` : `/c/${c.channelId}`;
}

interface Column {
  id: string;
  label: string;
  mark: ReactNode;
  strong: boolean;
}

interface Lane {
  id: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  /** Where "+ New" goes: an agent's own channel, or Claudia, who takes every new brief. */
  newHref: string;
  newLabel: string;
}

function ProjectMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0 text-ink-3">
      <path
        d="M2.5 4.25h3.25l1.25 1.5h4.5v4.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Cards ------------------------------------------------------------------

function LastLine({ c }: { c: Conversation }) {
  return (
    <>
      <span className="text-ink-3">{nameOf(c.last.actor, c.last.actorName)}:</span> {c.last.text}
    </>
  );
}

function Card({ c, props, showState }: { c: Conversation; props: Set<Property>; showState: boolean }) {
  const footer = props.has("agent") || props.has("priority") || props.has("provenance") || props.has("age");
  return (
    <li>
      <Link href={hrefOf(c)} data-board-card className="board-card block rounded-lg px-3 py-2.5">
        <span className="flex items-start gap-2">
          {showState && (
            <span className="mt-[3px]">
              <BoardStateMark kind={c.state} />
            </span>
          )}
          <span className="line-clamp-2 min-w-0 text-body font-medium text-ink">{c.task}</span>
        </span>
        <span className="sr-only">. {STATE_LABEL[c.state]}.</span>
        {c.note && <span className="mt-0.5 block text-meta text-ink-3">{c.note}</span>}
        {props.has("last") && (
          <span className="mt-1.5 line-clamp-2 block text-meta text-ink-2">
            <LastLine c={c} />
          </span>
        )}
        {footer && (
          <span className="mt-2 flex min-h-6 items-center gap-2.5 text-meta text-ink-3">
            {props.has("agent") && (
              <span className="flex min-w-0 items-center gap-1.5">
                <ActorAvatar id={c.agent} name={c.agentName} />
                <span className="truncate">{nameOf(c.agent, c.agentName)}</span>
              </span>
            )}
            {props.has("priority") && (
              <span className="flex shrink-0 items-center gap-1">
                <PriorityMark level={c.priority} />
                {PRIORITY_LABEL[c.priority]}
              </span>
            )}
            <span className="flex-1" />
            {props.has("provenance") && (
              <span
                className="flex shrink-0 items-center"
                title={c.provenance === "live" ? "Read live from Agents/handoffs/" : "Seeded to show the shape"}
              >
                <ProvenanceMark kind={c.provenance} />
                <span className="sr-only">{c.provenance === "live" ? "Read live" : "Seeded"}</span>
              </span>
            )}
            {props.has("age") && (
              <span className="shrink-0 tabular-nums">
                {formatAge(c.ageMinutes)}
                <span className="sr-only"> ago</span>
              </span>
            )}
          </span>
        )}
      </Link>
    </li>
  );
}

function NewLink({ href, label, children }: { href: string; label: string; children?: ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="aff flex min-h-8 items-center gap-1.5 rounded-md px-2 text-meta text-ink-3 hover:text-ink"
    >
      <PlusIcon className="h-3.5 w-3.5" />
      {children}
    </Link>
  );
}

// --- The display panel --------------------------------------------------------

function PanelRow({
  label,
  labelId,
  hint,
  children,
}: {
  label: string;
  labelId: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-10 items-center gap-3">
      <div className="min-w-0 flex-1">
        <div id={labelId} className="text-body text-ink-2">
          {label}
        </div>
        {hint && <div className="text-label text-ink-3">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function DisplayPanel({
  id,
  display,
  saved,
  onChange,
  onReset,
  onSetDefault,
  onClose,
}: {
  id: string;
  display: BoardDisplay;
  saved: BoardDisplay;
  onChange: (patch: Partial<BoardDisplay>) => void;
  onReset: () => void;
  onSetDefault: () => void;
  onClose: () => void;
}) {
  const uid = useId();
  const k = (name: string) => `${uid}-${name}`;
  const heading = useRef<HTMLHeadingElement>(null);
  const list = display.layout === "list";
  const isSaved = sameDisplay(display, saved);
  const canReset = !isSaved || !sameDisplay(saved, FACTORY_DISPLAY);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleProperty(p: Property) {
    const has = display.properties.includes(p);
    onChange({
      properties: PROPERTY_OPTIONS.map((o) => o.value).filter((v) => (v === p ? !has : display.properties.includes(v))),
    });
  }

  return (
    <section
      id={id}
      aria-labelledby={k("title")}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-xl bg-canvas px-4 pb-6 pt-3 shadow-2xl lg:static lg:z-auto lg:max-h-none lg:w-[19rem] lg:shrink-0 lg:rounded-none lg:border-l lg:border-line lg:pt-4 lg:shadow-none"
    >
      <div className="flex items-center gap-2">
        <h2
          id={k("title")}
          ref={heading}
          tabIndex={-1}
          className="flex-1 text-body font-semibold text-ink outline-none"
        >
          Display
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close display options"
          className="aff flex h-8 w-8 items-center justify-center rounded-md text-ink-3 hover:text-ink"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="seg mt-3" role="group" aria-label="Layout">
        {(["list", "board"] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={display.layout === l}
            onClick={() => onChange({ layout: l })}
            className={`flex h-8 flex-1 items-center justify-center gap-1.5 text-meta ${
              display.layout === l ? "font-semibold text-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            {l === "list" ? <ListIcon className="h-4 w-4" /> : <BoardIcon className="h-4 w-4" />}
            {l === "list" ? "List" : "Board"}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-1">
        <PanelRow label={list ? "Grouping" : "Columns"} labelId={k("columns")}>
          <Select
            compact
            id={k("columns-select")}
            labelledBy={k("columns")}
            value={display.columns}
            options={COLUMN_OPTIONS}
            onChange={(v) => onChange({ columns: v })}
          />
        </PanelRow>
        <PanelRow label="Rows" labelId={k("rows")} hint={list ? "Board only" : undefined}>
          <Select
            compact
            id={k("rows-select")}
            labelledBy={k("rows")}
            value={display.rows}
            options={ROW_OPTIONS}
            disabled={list}
            onChange={(v) => onChange({ rows: v })}
          />
        </PanelRow>
        <PanelRow label="Ordering" labelId={k("order")}>
          <Select
            compact
            id={k("order-select")}
            labelledBy={k("order")}
            value={display.order}
            options={ORDER_OPTIONS}
            onChange={(v) => onChange({ order: v })}
          />
        </PanelRow>
      </div>

      <div className="mt-3 space-y-1 border-t border-line pt-3">
        <PanelRow label="Show completed" labelId={k("completed")} hint="Done and Stopped">
          <Switch
            id={k("completed-switch")}
            labelledBy={k("completed")}
            checked={display.showCompleted}
            onChange={(v) => onChange({ showCompleted: v })}
          />
        </PanelRow>
        <PanelRow label={list ? "Show empty groups" : "Show empty columns"} labelId={k("empty-cols")}>
          <Switch
            id={k("empty-cols-switch")}
            labelledBy={k("empty-cols")}
            checked={display.showEmptyColumns}
            onChange={(v) => onChange({ showEmptyColumns: v })}
          />
        </PanelRow>
        <PanelRow label="Show empty rows" labelId={k("empty-rows")} hint={list ? "Board only" : undefined}>
          <Switch
            id={k("empty-rows-switch")}
            labelledBy={k("empty-rows")}
            checked={display.showEmptyRows}
            disabled={list || display.rows === "none"}
            onChange={(v) => onChange({ showEmptyRows: v })}
          />
        </PanelRow>
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <h3 className="text-label font-semibold uppercase tracking-[0.06em] text-ink-3">Display properties</h3>
        <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Display properties">
          {PROPERTY_OPTIONS.map((p) => {
            const on = display.properties.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggleProperty(p.value)}
                className={`chip flex min-h-7 items-center rounded-md px-2 text-meta ${on ? "text-ink" : "text-ink-3 hover:text-ink"}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-line pt-3">
        <p className="min-w-0 flex-1 text-label text-ink-3">Kept in this browser.</p>
        <button
          type="button"
          onClick={onReset}
          disabled={!canReset}
          title={isSaved ? "Back to Cohort's default" : "Back to your saved default"}
          className="aff flex min-h-8 items-center rounded-md px-2.5 text-meta text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onSetDefault}
          disabled={isSaved}
          className="aff-fill flex min-h-8 items-center rounded-md px-2.5 text-meta text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Set default
        </button>
      </div>
    </section>
  );
}

// --- The view -----------------------------------------------------------------

export function BoardView({ live }: { live: ReviewHandoff[] }) {
  const { settings } = useReviewSettings();
  const [saved, setSaved] = useLocalState(DEFAULT_KEY, FACTORY_DISPLAY, parseDisplay);
  const [chosen, setChosen] = useLocalState<BoardDisplay | null>(DISPLAY_KEY, null, parseMaybeDisplay);
  const [collapsed, setCollapsed] = useLocalState(LANES_KEY, NO_FLAGS, parseFlags);
  const [panelOpen, setPanelOpen] = useState(false);
  const displayButton = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const display = chosen ?? saved;
  const props = useMemo(() => new Set(display.properties), [display.properties]);
  const update = (patch: Partial<BoardDisplay>) => setChosen({ ...display, ...patch });

  const all = useMemo(() => {
    const resolved = resolveHandoffs([...SEEDED_HANDOFFS, ...live], settings);
    return [...fromHandoffs(resolved, (id) => nameOf(id)), ...SEEDED_CONVERSATIONS];
  }, [live, settings]);

  const visible = useMemo(
    () => sortConversations(display.showCompleted ? all : all.filter((c) => !isCompleted(c)), display.order),
    [all, display.showCompleted, display.order],
  );

  const colOf = (c: Conversation) => (display.columns === "state" ? c.state : c.priority);
  const columns: Column[] = (
    display.columns === "state"
      ? BOARD_STATES.filter((s) => display.showCompleted || (s !== "done" && s !== "stopped")).map((s) => ({
          id: s as string,
          label: STATE_LABEL[s],
          mark: <BoardStateMark kind={s} className={s === "needs" ? "text-ink-2" : "text-ink-3"} />,
          strong: s === "needs",
        }))
      : PRIORITIES.map((p) => ({
          id: p as string,
          label: PRIORITY_LABEL[p],
          mark: (
            <span className="text-ink-3">
              <PriorityMark level={p} />
            </span>
          ),
          strong: false,
        }))
  ).filter((col) => display.showEmptyColumns || visible.some((c) => colOf(c) === col.id));

  const laneOf = (c: Conversation) =>
    display.rows === "agent" ? c.agent : display.rows === "project" ? c.project : "all";

  const lanes: Lane[] = (() => {
    if (display.rows === "none") {
      return [
        {
          id: "all",
          label: "All",
          newHref: "/c/claudia",
          newLabel: "New task: brief Claudia",
        },
      ];
    }
    if (display.rows === "project") {
      return PROJECTS.map((p) => ({
        id: p.id as string,
        label: p.name,
        icon: <ProjectMark />,
        newHref: "/c/claudia",
        newLabel: `New ${p.name} task: brief Claudia`,
      }));
    }
    const outside = [...new Set(all.map((c) => c.agent).filter((a) => !isAgent(a)))];
    return [
      ...AGENT_ORDER.map((id) => ({
        id: id as string,
        label: AGENTS[id].name,
        hint: AGENTS[id].title,
        icon: <ActorAvatar id={id} />,
        newHref: `/c/${id}`,
        newLabel: `New task for ${AGENTS[id].name}`,
      })),
      ...outside.map((id) => {
        const name = all.find((c) => c.agent === id)?.agentName ?? id;
        return {
          id,
          label: name,
          hint: "Outside the registry",
          icon: <ActorAvatar id={id} name={name} />,
          newHref: "/c/claudia",
          newLabel: `New task: brief Claudia (${name} is not in the registry)`,
        };
      }),
    ];
  })().filter((lane) => display.rows === "none" || display.showEmptyRows || visible.some((c) => laneOf(c) === lane.id));

  const laneKey = (id: string) =>
    display.layout === "list" ? `list:${display.columns}:${id}` : `${display.rows}:${id}`;
  const isCollapsed = (id: string) => collapsed[laneKey(id)] ?? false;
  const toggleLane = (id: string) => setCollapsed({ ...collapsed, [laneKey(id)]: !isCollapsed(id) });

  function closePanel() {
    setPanelOpen(false);
    requestAnimationFrame(() => displayButton.current?.focus());
  }

  const liveCount = live.length;
  const showState = display.columns !== "state";
  const queuedNew = display.columns === "state" && columns.some((c) => c.id === "queued");

  const layoutSeg = (
    <div className="hidden sm:block">
      <div className="seg" role="group" aria-label="Layout">
        {(["list", "board"] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={display.layout === l}
            aria-label={l === "list" ? "List" : "Board"}
            data-tip={l === "list" ? "List" : "Board"}
            onClick={() => update({ layout: l })}
            className={`tip flex h-7 w-8 items-center justify-center ${display.layout === l ? "text-ink" : "text-ink-3 hover:text-ink"}`}
          >
            {l === "list" ? <ListIcon className="h-4 w-4" /> : <BoardIcon className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </div>
  );

  const header = (
    <div className="flex min-w-0 items-center gap-2">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-heading font-semibold text-ink">Board</h1>
        <p className="truncate text-meta text-ink-3">Every agent conversation, by where it stands.</p>
      </div>
      {layoutSeg}
      <button
        ref={displayButton}
        type="button"
        aria-label="Display options"
        aria-expanded={panelOpen}
        aria-controls={panelId}
        onClick={() => (panelOpen ? closePanel() : setPanelOpen(true))}
        className={`aff flex h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-md text-meta sm:h-8 sm:w-auto sm:px-2 ${
          panelOpen ? "bg-[var(--aff-sel)] text-ink" : "text-ink-3 hover:text-ink"
        }`}
      >
        <SettingsIcon />
        <span className="hidden sm:inline">Display</span>
      </button>
    </div>
  );

  const total = visible.length;
  const empty = total === 0 && (
    <p className="px-4 py-10 text-body text-ink-3 lg:px-6">
      Nothing to show. {display.showCompleted ? "" : "Completed conversations are hidden. "}
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink"
      >
        Change the display
      </button>
    </p>
  );

  const board = (
    <div className="min-w-max px-4 pb-16 lg:px-6" style={{ ["--colw" as string]: "16.5rem" }}>
      <div
        className="sticky top-0 z-10 grid gap-2 bg-canvas pb-2 pt-3"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, var(--colw))`,
        }}
      >
        {columns.map((col) => (
          <div
            key={col.id}
            data-strong={col.strong || undefined}
            className="board-col-head flex h-9 items-center gap-2 rounded-md px-3"
          >
            {col.mark}
            <h2 className="text-meta font-semibold text-ink">{col.label}</h2>
            <span className="text-meta tabular-nums text-ink-3">
              {visible.filter((c) => colOf(c) === col.id).length}
            </span>
          </div>
        ))}
      </div>

      {lanes.map((lane) => {
        const items = visible.filter((c) => laneOf(c) === lane.id);
        const shut = display.rows !== "none" && isCollapsed(lane.id);
        return (
          <section key={lane.id} aria-label={display.rows === "none" ? "Conversations" : lane.label} className="mb-3">
            {display.rows !== "none" && (
              <div className="sticky left-4 flex w-max max-w-[calc(100vw-2rem)] items-center gap-1 py-1 lg:left-6">
                <button
                  type="button"
                  onClick={() => toggleLane(lane.id)}
                  aria-expanded={!shut}
                  aria-controls={`lane-${lane.id}`}
                  className="aff flex min-h-8 min-w-0 items-center gap-2 rounded-md px-2 text-left"
                >
                  <span className="text-ink-3">
                    {shut ? <ChevronRightIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
                  </span>
                  {lane.icon}
                  <span className="truncate text-meta font-semibold text-ink">{lane.label}</span>
                  {lane.hint && <span className="hidden truncate text-meta text-ink-3 sm:inline">{lane.hint}</span>}
                  <span className="text-meta tabular-nums text-ink-3">{items.length}</span>
                </button>
                {!queuedNew && <NewLink href={lane.newHref} label={lane.newLabel} />}
              </div>
            )}
            {!shut && (
              <div
                id={`lane-${lane.id}`}
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${columns.length}, var(--colw))`,
                }}
              >
                {columns.map((col) => {
                  const cell = items.filter((c) => colOf(c) === col.id);
                  return (
                    <div
                      key={col.id}
                      data-strong={col.strong || undefined}
                      className="board-col min-h-12 rounded-md p-1.5"
                    >
                      {cell.length > 0 && (
                        <ul className="space-y-1.5" aria-label={`${col.label}, ${cell.length}`}>
                          {cell.map((c) => (
                            <Card key={c.id} c={c} props={props} showState={showState} />
                          ))}
                        </ul>
                      )}
                      {col.id === "queued" && queuedNew && (
                        <div className={cell.length ? "mt-1" : ""}>
                          <NewLink href={lane.newHref} label={lane.newLabel}>
                            New
                          </NewLink>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );

  const listView = (
    <div className="px-2 pb-16 pt-3 lg:px-4">
      {columns.map((col) => {
        const items = visible.filter((c) => colOf(c) === col.id);
        const shut = isCollapsed(col.id);
        return (
          <section key={col.id} aria-label={col.label} className="mb-2">
            <h2>
              <button
                type="button"
                onClick={() => toggleLane(col.id)}
                aria-expanded={!shut}
                aria-controls={`group-${col.id}`}
                data-strong={col.strong || undefined}
                className="board-col-head flex min-h-9 w-full items-center gap-2 rounded-md px-3 text-left"
              >
                <span className="text-ink-3">
                  {shut ? <ChevronRightIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
                </span>
                {col.mark}
                <span className="text-meta font-semibold text-ink">{col.label}</span>
                <span className="text-meta tabular-nums text-ink-3">{items.length}</span>
              </button>
            </h2>
            {!shut && (
              <ul id={`group-${col.id}`} className="mt-0.5 space-y-0.5">
                {items.length === 0 && <li className="px-3 py-2 text-meta text-ink-3">Nothing here.</li>}
                {items.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={hrefOf(c)}
                      data-board-card
                      className="aff flex min-h-11 items-center gap-3 rounded-md px-3 py-1.5"
                    >
                      {showState && <BoardStateMark kind={c.state} />}
                      {props.has("priority") && (
                        <span className="text-ink-3" title={`${PRIORITY_LABEL[c.priority]} priority`}>
                          <PriorityMark level={c.priority} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body text-ink">{c.task}</span>
                        {(c.note || props.has("last")) && (
                          <span className="block truncate text-meta text-ink-3">{c.note ?? <LastLine c={c} />}</span>
                        )}
                      </span>
                      <span className="sr-only">. {STATE_LABEL[c.state]}.</span>
                      {props.has("provenance") && (
                        <span title={c.provenance === "live" ? "Read live" : "Seeded"} className="text-ink-3">
                          <ProvenanceMark kind={c.provenance} />
                        </span>
                      )}
                      {props.has("agent") && <ActorAvatar id={c.agent} name={c.agentName} />}
                      {props.has("age") && (
                        <span className="w-7 shrink-0 text-right text-meta tabular-nums text-ink-3">
                          {formatAge(c.ageMinutes)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );

  return (
    <AppShell activeChannelId={null} header={header} rail={false}>
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3 lg:px-6">
            <ProvenanceTag
              kind="seeded"
              title="Handoffs come from Reviews, placed by your review settings. The rest are seeded conversations."
            >
              Seeded, plus {liveCount} {liveCount === 1 ? "note" : "notes"} read live
            </ProvenanceTag>
            <span className="text-meta tabular-nums text-ink-3">
              {total} {total === 1 ? "conversation" : "conversations"}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto" aria-label="Conversations" role="region" tabIndex={-1}>
            {empty || (display.layout === "board" ? board : listView)}
          </div>
        </div>
        {panelOpen && (
          <>
            <button
              type="button"
              aria-label="Close display options"
              tabIndex={-1}
              onClick={closePanel}
              className="fixed inset-0 z-40 bg-scrim lg:hidden"
            />
            <DisplayPanel
              id={panelId}
              display={display}
              saved={saved}
              onChange={update}
              onReset={() => {
                if (sameDisplay(display, saved)) setSaved(FACTORY_DISPLAY);
                setChosen(null);
              }}
              onSetDefault={() => {
                setSaved(display);
                setChosen(null);
              }}
              onClose={closePanel}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
