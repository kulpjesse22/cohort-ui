import type { ActorId } from "./agents";
import type { Verdict } from "./timeline";
import {
  archiveMinutes,
  staleMinutes,
  type ReviewSettings,
  type StaleStatus,
} from "./settings";

/**
 * Handoffs waiting on a person. Two sources, labelled as such wherever they
 * show: seeded handoffs written to show the shape (with diffs), and the real
 * notes in Agents/handoffs/, read off disk per request (no diff — the harness
 * records the baton pass, not the patch).
 *
 * Settings never change the record. A handoff closed as stale is closed in
 * this browser's view of it; the file on disk is untouched.
 */

export const YOU: ActorId = "jesse";

export type ReviewState = "waiting" | "reviewing" | "revising" | "done" | "filed";

export type StepKind = "read" | "change" | "check" | "handoff" | "review" | "decision" | "close";

export interface ReviewStep {
  minutesAgo: number;
  actor: ActorId;
  /** External contributors (Claude, Codex) are not participants; name them directly. */
  actorName?: string;
  kind: StepKind;
  text: string;
  path?: string;
}

export interface DiffFile {
  path: string;
  /** Unified hunks: each line starts with " ", "+" or "-". */
  hunks: { oldStart: number; newStart: number; lines: string[] }[];
}

export interface ReviewGuide {
  summary: string;
  changed: string[];
  check: string[];
  untouched?: string[];
}

export interface ReviewHandoff {
  id: string;
  title: string;
  author: ActorId;
  authorName?: string;
  /** null routes to the default reviewer in settings. */
  reviewer: ActorId | null;
  state: ReviewState;
  verdict?: Verdict;
  /** Minutes since the handoff was filed. */
  ageMinutes: number;
  /** Minutes since a reviewer closed it. Only for `done`. */
  completedMinutesAgo?: number;
  branch: string | null;
  files: DiffFile[];
  guide: ReviewGuide;
  activity: ReviewStep[];
  provenance: "seeded" | "live";
  /** The handoff file on disk, for live ones. */
  source?: string;
  /** Files the note names but does not patch. */
  namedFiles?: string[];
  /** Sections of a live note, in file order. */
  sections?: { heading: string; items: string[] }[];
  /** Why a review came back, shown beside a Revise. */
  fixes?: string[];
}

export type ResolvedStatus =
  | { kind: "waiting"; live: boolean }
  | { kind: "reviewing" }
  | { kind: "revising" }
  | { kind: "verdict"; verdict: Verdict }
  | { kind: "filed" }
  | { kind: "stale"; as: StaleStatus };

export type ReviewGroup = "needs" | "reviewing" | "completed" | "elsewhere" | "archived";

export interface ResolvedHandoff extends ReviewHandoff {
  reviewerId: ActorId;
  status: ResolvedStatus;
  group: ReviewGroup;
  /** Minutes since it left the open queue, for completed and archived. */
  closedMinutesAgo?: number;
}

export function resolveHandoffs(items: ReviewHandoff[], settings: ReviewSettings): ResolvedHandoff[] {
  const stale = staleMinutes(settings);
  const archive = archiveMinutes(settings);

  return items.map((item) => {
    const reviewerId = item.reviewer ?? settings.defaultReviewer;
    let status: ResolvedStatus;
    let closedMinutesAgo: number | undefined;

    if (item.state === "done" && item.verdict) {
      status = { kind: "verdict", verdict: item.verdict };
      closedMinutesAgo = item.completedMinutesAgo ?? 0;
    } else if (item.state === "filed") {
      status = { kind: "filed" };
      closedMinutesAgo = item.ageMinutes;
    } else if (settings.autoClose && item.ageMinutes >= stale) {
      status = { kind: "stale", as: settings.staleStatus };
      closedMinutesAgo = item.ageMinutes - stale;
    } else if (item.state === "reviewing") {
      status = { kind: "reviewing" };
    } else if (item.state === "revising") {
      status = { kind: "revising" };
    } else {
      status = { kind: "waiting", live: item.provenance === "live" };
    }

    let group: ReviewGroup;
    if (closedMinutesAgo !== undefined) {
      group = archive !== null && closedMinutesAgo >= archive ? "archived" : "completed";
    } else if (reviewerId !== YOU) {
      group = "elsewhere";
    } else {
      group = status.kind === "waiting" ? "needs" : "reviewing";
    }

    return { ...item, reviewerId, status, group, closedMinutesAgo };
  });
}

export function lineCounts(files: DiffFile[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const f of files) {
    for (const h of f.hunks) {
      for (const l of h.lines) {
        if (l.startsWith("+")) added += 1;
        else if (l.startsWith("-")) removed += 1;
      }
    }
  }
  return { added, removed };
}

export function formatAge(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h`;
  const days = hours / 24;
  if (days < 60) return `${Math.floor(days)}d`;
  return `${Math.floor(days / 30)}mo`;
}

export function formatAgo(minutes: number): string {
  const age = formatAge(minutes);
  return `${age} ago`;
}

const H = 60;
const D = 24 * H;

export const SEEDED_HANDOFFS: ReviewHandoff[] = [
  {
    id: "keep-draft-on-failed-send",
    title: "Keep the draft when a send fails",
    author: "julius",
    reviewer: YOU,
    state: "waiting",
    ageMinutes: 58,
    branch: "julius/keep-draft-on-failed-send",
    provenance: "seeded",
    files: [
      {
        path: "components/Composer.tsx",
        hunks: [
          {
            oldStart: 118,
            newStart: 118,
            lines: [
              "   async function submit() {",
              "     const value = text.trim();",
              "     if (!value || sending) return;",
              "     setSending(true);",
              "     setError(null);",
              "-    setText(\"\");",
              "-    onTyping?.(false);",
              "     try {",
              "       await onSend(value);",
              "+      setText(\"\");",
              "+      onTyping?.(false);",
              "     } catch (e) {",
              "-      setError(\"Couldn't send. Try again.\");",
              "+      // The draft stays in the box: a failed send must never cost the message.",
              "+      setError(e instanceof Error ? e.message : \"Couldn't send. Your message is still here.\");",
              "     } finally {",
              "       setSending(false);",
              "     }",
              "   }",
            ],
          },
        ],
      },
    ],
    guide: {
      summary:
        "The composer used to clear the box the moment you pressed Enter. If the send then failed, the message was gone. Now the box clears only after the server accepts it.",
      changed: [
        "The text is cleared after a successful send, not before it.",
        "A failed send shows the server's reason inline, under the box, and leaves your words where they were.",
      ],
      check: [
        "Turn the network off, send a message, and confirm the text is still there with an error under it.",
        "Send normally and confirm the box still empties and the typing indicator stops.",
        "The error sits next to the composer, not in a toast.",
      ],
      untouched: ["The send endpoint and its error messages.", "Shift+Enter still adds a new line."],
    },
    activity: [
      { minutesAgo: 140, actor: "claudia", kind: "handoff", text: "Assigned from the queue: a failed send loses the draft.", path: "Agents/tasks/julius.md" },
      { minutesAgo: 131, actor: "julius", kind: "read", text: "Read the error-recovery rule in the UX guide.", path: "Agents/UX.md" },
      { minutesAgo: 96, actor: "julius", kind: "change", text: "Moved the clear after the send and kept the draft on failure." },
      { minutesAgo: 71, actor: "julius", kind: "check", text: "Ran npx tsc --noEmit and sent with the network off, in both themes." },
      { minutesAgo: 58, actor: "julius", kind: "handoff", text: "Handed to you for review." },
    ],
  },
  {
    id: "status-outliving-agent",
    title: "Stop a status line outliving its agent",
    author: "augustus",
    reviewer: YOU,
    state: "waiting",
    ageMinutes: 102,
    branch: "augustus/status-stale-window",
    provenance: "seeded",
    files: [
      {
        path: "lib/realtime/status.ts",
        hunks: [
          {
            oldStart: 14,
            newStart: 14,
            lines: [
              "  * lie with a timestamp on it. Anything older than the window is dropped.",
              "  */",
              "-const STALE_AFTER_MS = 90_000;",
              "+export const STALE_AFTER_MS = 90_000;",
              "+",
              "+/** True once a status has outlived the window. The header greys it, then drops it. */",
              "+export function isStale(status: AgentStatus, now = Date.now()): boolean {",
              "+  return now - status.ts > STALE_AFTER_MS;",
              "+}",
              " ",
              " export interface AgentStatus {",
              "   agentId: AgentId;",
            ],
          },
          {
            oldStart: 45,
            newStart: 50,
            lines: [
              " export async function getStatuses(channelId: string): Promise<AgentStatus[]> {",
              "-  const cutoff = Date.now() - STALE_AFTER_MS;",
              "+  const now = Date.now();",
              "   let all: AgentStatus[];",
              " ",
              "   if (redisEnabled) {",
            ],
          },
          {
            oldStart: 64,
            newStart: 69,
            lines: [
              "     all = [...(memory.get(channelId)?.values() ?? [])];",
              "   }",
              "-  return all.filter((s) => s.ts >= cutoff);",
              "+  return all.filter((s) => !isStale(s, now));",
              " }",
            ],
          },
        ],
      },
    ],
    guide: {
      summary:
        "An agent that dies mid-task never says it is done, so its last status could sit in the header looking current. The ninety-second rule already existed; this makes it one named check the header can share.",
      changed: [
        "The stale window is exported, with an isStale helper beside it.",
        "Statuses are filtered through that helper instead of a cutoff computed inline.",
      ],
      check: [
        "The window is still ninety seconds. Nothing should go stale sooner than before.",
        "Post a status with the events endpoint, wait two minutes, and confirm the header falls back to the illustrative rotation.",
      ],
      untouched: ["The header itself. Greying a status before it drops is the next task, not this one."],
    },
    activity: [
      { minutesAgo: 230, actor: "claudia", kind: "handoff", text: "Assigned: the header can claim work nobody is doing.", path: "Agents/tasks/augustus.md" },
      { minutesAgo: 214, actor: "augustus", kind: "read", text: "Read lib/realtime/status.ts and its callers." },
      { minutesAgo: 170, actor: "augustus", kind: "change", text: "Named the stale check and routed the filter through it." },
      { minutesAgo: 121, actor: "augustus", kind: "check", text: "Posted a status, waited 120 seconds, saw it drop." },
      { minutesAgo: 102, actor: "augustus", kind: "handoff", text: "Handed to you for review." },
    ],
  },
  {
    id: "revise-mark-at-12px",
    title: "Redraw the Revise mark for 12px",
    author: "hephaestus",
    reviewer: null,
    state: "waiting",
    ageMinutes: 131,
    branch: "hephaestus/revise-mark-contract",
    provenance: "seeded",
    files: [
      {
        path: "Agents/designs/verdict-marks.md",
        hunks: [
          {
            oldStart: 22,
            newStart: 22,
            lines: [
              " ## Revise",
              " ",
              "-A ring that turns back on itself, 1.4px stroke, arrowhead at 12 o'clock.",
              "+A ring that turns back on itself. At 12px the arrowhead closed into a",
              "+blob, so it moves to 1 o'clock and the stroke drops to 1.3px.",
              "+",
              "+- Draw the arrowhead as two strokes, not a filled wedge.",
              "+- Check it in grayscale beside Approved and Approved with fixes.",
              " ",
              " ## Do not",
              " ",
              " - Fill the ring. Filled means approved.",
            ],
          },
        ],
      },
    ],
    guide: {
      summary:
        "A design contract, not code: Hephaestus never touches product code. The Revise mark blurred at timeline size, and this note says how to redraw it so a builder can pick it up.",
      changed: ["The Revise section of the verdict-marks contract: new arrowhead position, thinner stroke, and two checks."],
      check: [
        "The three verdict marks still read apart in grayscale, which is the rule shape carries state.",
        "Nothing here fills the ring: filled means Approved.",
        "Who builds it is left to Claudia's queue, not named here.",
      ],
    },
    activity: [
      { minutesAgo: 300, actor: "athena", kind: "review", text: "Flagged in #design-crit: Revise reads as a dot at 12px." },
      { minutesAgo: 260, actor: "hephaestus", kind: "read", text: "Read the States section of the design guide.", path: "Agents/design.md" },
      { minutesAgo: 190, actor: "hephaestus", kind: "change", text: "Rewrote the Revise section of the contract." },
      { minutesAgo: 131, actor: "hephaestus", kind: "handoff", text: "Handed off with no reviewer named. Your default reviewer picks it up." },
    ],
  },
  {
    id: "split-density-pass",
    title: "Split the density pass into one surface per task",
    author: "claudia",
    reviewer: YOU,
    state: "waiting",
    ageMinutes: 205,
    branch: null,
    provenance: "seeded",
    files: [
      {
        path: "Agents/planning.md",
        hunks: [
          {
            oldStart: 31,
            newStart: 31,
            lines: [
              " ## Active queue",
              " ",
              "-1. Density pass across every surface (Claude, UI lane)",
              "+1. Density pass: LessonLadder.tsx only, as the pattern-setter (Claude)",
              "+2. Density pass: the thread and composer, after 1 is reviewed (Julius)",
              "+3. Density pass: the context rail, after 2 (Augustus)",
              " ",
              " ## Stop conditions",
              " ",
              "-- None recorded.",
              "+- Stop if globals.css needs a rule two lanes both touch. Ask Jesse.",
            ],
          },
        ],
      },
    ],
    guide: {
      summary:
        "Claudia turned one sweeping task into three ordered ones, so two lanes stop editing globals.css at the same time. She is asking before she assigns, because the order is a product choice.",
      changed: ["The active queue now lists three density tasks, each waiting on the one before.", "A stop condition names the shared stylesheet."],
      check: [
        "Is LessonLadder the right surface to set the pattern?",
        "Should the thread come before the context rail, or the other way round?",
        "Approve and Claudia assigns the first task. Nothing is assigned until then.",
      ],
    },
    activity: [
      { minutesAgo: 520, actor: "jesse", kind: "decision", text: "Asked for the density pass to land one surface at a time." },
      { minutesAgo: 470, actor: "claudia", kind: "read", text: "Read both open handoffs on the density pass.", path: "Agents/handoffs/2026-08-16-visual-density-pass.md" },
      { minutesAgo: 260, actor: "claudia", kind: "change", text: "Rewrote the active queue and added a stop condition." },
      { minutesAgo: 205, actor: "claudia", kind: "handoff", text: "Stopped to ask before assigning anyone." },
    ],
  },
  {
    id: "tour-caption-tokens",
    title: "Move the tour captions onto the type tokens",
    author: "julius",
    reviewer: YOU,
    state: "waiting",
    ageMinutes: 19 * D + 3 * H,
    branch: "julius/tour-type-tokens",
    provenance: "seeded",
    files: [
      {
        path: "components/DemoTour.tsx",
        hunks: [
          {
            oldStart: 288,
            newStart: 288,
            lines: [
              "       <div className=\"tour-caption-copy\">",
              "-        <h2 className=\"text-[17px] font-semibold tracking-[-0.01em] text-ink\">",
              "+        <h2 className=\"text-heading font-semibold text-ink\">",
              "           {step.title}",
              "         </h2>",
              "-        <p className=\"mt-1 text-[13px] leading-5 text-ink-2\">{step.caption}</p>",
              "+        <p className=\"mt-1 text-body text-ink-2\">{step.caption}</p>",
              "       </div>",
            ],
          },
        ],
      },
    ],
    guide: {
      summary: "Two hand-set sizes in the tour caption become the named type steps, so the caption follows the scale when it changes.",
      changed: ["Caption title on text-heading, caption body on text-body."],
      check: ["The caption height must not change between steps: the tour's motion check fails on layout that moves.", "Run npm run check:motion."],
    },
    activity: [
      { minutesAgo: 19 * D + 9 * H, actor: "julius", kind: "change", text: "Swapped the two sizes for type tokens." },
      { minutesAgo: 19 * D + 4 * H, actor: "julius", kind: "check", text: "Ran npm run check:motion." },
      { minutesAgo: 19 * D + 3 * H, actor: "julius", kind: "handoff", text: "Handed to you for review." },
    ],
  },
  {
    id: "memory-tier-empty-states",
    title: "Give each memory tier an empty state",
    author: "julius",
    reviewer: YOU,
    state: "reviewing",
    ageMinutes: 4 * H + 10,
    branch: "julius/memory-empty-tiers",
    provenance: "seeded",
    files: [
      {
        path: "components/LessonLadder.tsx",
        hunks: [
          {
            oldStart: 12,
            newStart: 12,
            lines: [
              " const TIER_NAME = { 0: \"Becoming code\", 1: \"Always on\", 2: \"Conditional\" } as const;",
              "+",
              "+// Blank is not neutral. Each tier says what would put something here.",
              "+const EMPTY = {",
              "+  0: \"Nothing queued to become a check.\",",
              "+  1: \"No standing rules yet. A lesson that keeps firing is promoted here.\",",
              "+  2: \"No lessons yet. One lands here when a review names a repeat failure.\",",
              "+} as const;",
            ],
          },
          {
            oldStart: 141,
            newStart: 148,
            lines: [
              "     <section aria-labelledby={id}>",
              "       <TierHeading tier={tier} />",
              "+      {tier.entries.length === 0 && (",
              "+        <p className=\"py-3 text-body text-ink-3\">{EMPTY[tier.level]}</p>",
              "+      )}",
              "       <ul className=\"divide-y divide-line\">",
            ],
          },
        ],
      },
    ],
    guide: {
      summary: "A fresh harness has empty tiers, and the ladder showed them as nothing at all. Each tier now says, in one plain sentence, what would land there.",
      changed: ["Three empty-state sentences, one per tier.", "They show only when a tier has no entries."],
      check: [
        "Point HARNESS_ROOT at an empty harness and open /memory.",
        "Plain sentences in ink-3, no illustration and no dashed box.",
        "Empty and missing are still different: a missing index keeps its own message.",
      ],
    },
    activity: [
      { minutesAgo: 9 * H, actor: "claudia", kind: "handoff", text: "Assigned: empty tiers render as blank space.", path: "Agents/tasks/julius.md" },
      { minutesAgo: 6 * H, actor: "julius", kind: "change", text: "Wrote one sentence per tier." },
      { minutesAgo: 4 * H + 10, actor: "julius", kind: "handoff", text: "Handed to you for review." },
      { minutesAgo: 3 * H, actor: "jesse", kind: "review", text: "You opened the review." },
    ],
  },
  {
    id: "presence-tab-sleep",
    title: "Keep a sleeping tab in the room",
    author: "augustus",
    reviewer: YOU,
    state: "revising",
    ageMinutes: 26 * H,
    branch: "augustus/presence-ttl",
    provenance: "seeded",
    fixes: [
      "A longer window also keeps a closed tab in the room for 75 seconds. Send a leave beacon on pagehide instead of only stretching the TTL.",
      "Say in the comment which browsers throttle background timers, so the number can be revisited.",
    ],
    files: [
      {
        path: "lib/realtime/presence.ts",
        hunks: [
          {
            oldStart: 9,
            newStart: 9,
            lines: [
              "-const HEARTBEAT_TTL_MS = 30_000;",
              "+// A backgrounded tab throttles timers to about once a minute, so a 30s",
              "+// window dropped viewers who were still there.",
              "+const HEARTBEAT_TTL_MS = 75_000;",
            ],
          },
        ],
      },
    ],
    guide: {
      summary: "People who switched tabs vanished from the presence bar while they were still reading. The heartbeat window grows from 30 to 75 seconds.",
      changed: ["The presence time-to-live is 75 seconds."],
      check: ["Background a tab for two minutes and confirm you stay in the room.", "Close a tab and see how long it lingers."],
    },
    activity: [
      { minutesAgo: 30 * H, actor: "augustus", kind: "change", text: "Lengthened the heartbeat window." },
      { minutesAgo: 26 * H, actor: "augustus", kind: "handoff", text: "Handed to you for review." },
      { minutesAgo: 22 * H, actor: "jesse", kind: "review", text: "You returned it: Revise, with two fixes assigned back to Augustus." },
    ],
  },
  {
    id: "pin-design-guide-crit",
    title: "Pin the design guide in #design-crit",
    author: "augustus",
    reviewer: YOU,
    state: "done",
    verdict: "Approved",
    ageMinutes: 3 * D,
    completedMinutesAgo: 2 * D + 5 * H,
    branch: "augustus/crit-rail-guide",
    provenance: "seeded",
    files: [
      {
        path: "lib/harness.ts",
        hunks: [
          {
            oldStart: 56,
            newStart: 56,
            lines: [
              "   \"design-crit\": [",
              "     [\"Design artifacts\", \"Agents/designs/README.md\"],",
              "     [\"Handoffs\", \"Agents/handoffs/README.md\"],",
              "+    [\"Design guide\", \"Agents/design.md\"],",
              "   ],",
            ],
          },
        ],
      },
    ],
    guide: {
      summary: "Crit argues about the design guide, so the guide is now pinned in the crit channel's rail.",
      changed: ["#design-crit pins Agents/design.md third, after artifacts and handoffs."],
      check: ["Open #design-crit and find the guide in the right rail."],
    },
    activity: [
      { minutesAgo: 3 * D + 2 * H, actor: "augustus", kind: "change", text: "Added the guide to the crit channel's pins." },
      { minutesAgo: 3 * D, actor: "augustus", kind: "handoff", text: "Handed to you for review." },
      { minutesAgo: 2 * D + 5 * H, actor: "jesse", kind: "review", text: "You approved it." },
    ],
  },
  {
    id: "type-scale-guide",
    title: "Write the type scale into the design guide",
    author: "hephaestus",
    reviewer: YOU,
    state: "done",
    verdict: "Approved with fixes",
    ageMinutes: 7 * D,
    completedMinutesAgo: 6 * D,
    branch: "hephaestus/type-scale",
    provenance: "seeded",
    fixes: ["Say why tracking stops at 14px, not only that it does."],
    files: [
      {
        path: "Agents/design.md",
        hunks: [
          {
            oldStart: 186,
            newStart: 186,
            lines: [
              "-| `text-title` | 26 / 1.15 | Display 600 | A screen's lead sentence |",
              "+| `text-title` | 28 / 1.1, −0.025em | Display 600 | A screen's lead sentence (two-tone: ink, then `ink-3`), the promotion, the 404 |",
              " | `text-figure` | 32 / 1, −0.03em | Display 600, tabular | Stat figures: profile summary, memory counts |",
            ],
          },
        ],
      },
    ],
    guide: {
      summary: "The title step grows to 28px and gains its tracking and its uses, so a builder can pick the step by job rather than by size.",
      changed: ["The text-title row of the type scale."],
      check: ["Every surface that leads with text-title still holds one line at 390px."],
    },
    activity: [
      { minutesAgo: 7 * D + 3 * H, actor: "hephaestus", kind: "change", text: "Rewrote the title row of the scale." },
      { minutesAgo: 7 * D, actor: "hephaestus", kind: "handoff", text: "Handed to you for review." },
      { minutesAgo: 6 * D, actor: "jesse", kind: "review", text: "You approved it with one fix." },
    ],
  },
  {
    id: "channel-slugs",
    title: "Show channel slugs in the sidebar",
    author: "julius",
    reviewer: YOU,
    state: "done",
    verdict: "Approved",
    ageMinutes: 42 * D,
    completedMinutesAgo: 41 * D,
    branch: "julius/channel-slugs",
    provenance: "seeded",
    files: [
      {
        path: "components/Sidebar.tsx",
        hunks: [
          {
            oldStart: 74,
            newStart: 74,
            lines: [
              "               >",
              "-                <span className=\"truncate\">{channel.name}</span>",
              "+                <span className=\"text-sidebar-ink-3\">#</span>",
              "+                <span className=\"truncate\">{channel.id}</span>",
              "               </button>",
            ],
          },
        ],
      },
    ],
    guide: {
      summary: "Channel rows show the slug after a muted #, the way the UX guide spells channels.",
      changed: ["The sidebar channel row."],
      check: ["#design-crit fits in the 256px sidebar."],
    },
    activity: [
      { minutesAgo: 42 * D + 2 * H, actor: "julius", kind: "change", text: "Split the # from the slug." },
      { minutesAgo: 42 * D, actor: "julius", kind: "handoff", text: "Handed to you for review." },
      { minutesAgo: 41 * D, actor: "jesse", kind: "review", text: "You approved it." },
    ],
  },
];
