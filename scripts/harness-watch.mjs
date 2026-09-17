#!/usr/bin/env node
/**
 * The harness end of the status feed.
 *
 * Cohort's header can show what an agent is doing, but the browser is not where
 * the work happens and has no way to find out on its own. This watches the
 * harness on disk and posts to `/api/events`, which is the only arrangement
 * that can be honest: the UI is downstream of the work.
 *
 * Two kinds of signal, kept apart on purpose.
 *
 * State comes from `Agents/tasks/<agent>.md`, whose Assigned Queue block already
 * carries the fields a status line needs — Status, Active now, Task / outcome.
 * It stays true for as long as the file says so, and is re-posted on a timer
 * because a status expires server-side.
 *
 * Events are things that just happened: the plan was rewritten, a handoff was
 * filed. They are posted once and allowed to lapse.
 *
 * The roster is read, not hardcoded. Workers are whoever has a task queue,
 * which is the harness's own convention for who is doing work. An agent Cohort
 * does not know about is rejected by the API with a 400 and reported here once.
 *
 *   COHORT_URL=http://localhost:3000 \
 *   COHORT_EVENTS_SECRET=... \
 *   npm run harness:watch
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const ROOT = process.env.HARNESS_ROOT ?? process.cwd();
const AGENTS_DIR = path.join(ROOT, "Agents");
const BASE = (process.env.COHORT_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SECRET = process.env.COHORT_EVENTS_SECRET;

/** Server drops a status at 90s. Re-post well inside that, not at the edge. */
const REFRESH_MS = 45_000;
const DEBOUNCE_MS = 400;
/**
 * A request that never returns is worse here than one that fails.
 *
 * Without this the first hung connection stalls a sweep forever, later sweeps
 * queue up behind it, and the feed goes quiet with nothing in the log to say
 * so — the statuses simply expire and the header falls back to the rotation.
 * Found exactly that way: a watcher alive for ninety minutes, reporting
 * nothing, with no error to show for it.
 */
const REQUEST_TIMEOUT_MS = 5_000;
const ONCE = process.argv.includes("--once");

/** The team room, plus the agent's own channel. Both get every status. */
const TEAM_CHANNEL = "cohort";

const warned = new Set();

/** Same complaint, once. A sweep every 45s must not become a log every 45s. */
function warnOnce(tag, message) {
  if (warned.has(tag)) return;
  warned.add(tag);
  console.warn(message);
}

function clip(s, n) {
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/** "none", "none open", "n/a" — the harness's several ways of saying nothing. */
function isEmptyValue(v) {
  return !v || /^(none|none open|n\/a|-)$/i.test(v.trim());
}

/** Pulls `- Key: value` pairs out of one `## Section` of a harness file. */
function readSection(markdown, heading) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((l) => l.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (start === -1) return {};
  const fields = {};
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    const m = line.match(/^\s*-\s*([^:]+):\s*(.*)$/);
    if (m) fields[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return fields;
}

/** `Key: value` from the top matter of a file, before any section. */
function readPreamble(markdown, key) {
  const m = markdown.match(new RegExp(`^${key}:\\s*(.+)$`, "im"));
  return m ? m[1].trim() : null;
}

async function readIfPresent(file) {
  try {
    return await fsp.readFile(file, "utf8");
  } catch {
    return null;
  }
}

/**
 * What each worker's queue says it is doing right now.
 *
 * A queue that reads complete, or has nothing active, produces nothing. That is
 * the point: silence is the accurate report when no agent is running, and the
 * header falls back to saying it is illustrative.
 */
async function readWorkerStates() {
  let entries;
  try {
    entries = await fsp.readdir(path.join(AGENTS_DIR, "tasks"));
  } catch {
    return [];
  }

  const states = [];
  for (const entry of entries) {
    if (!entry.endsWith(".md") || /^(README|TEMPLATE)\.md$/i.test(entry)) continue;
    const agentId = entry.replace(/\.md$/, "").toLowerCase();
    const raw = await readIfPresent(path.join(AGENTS_DIR, "tasks", entry));
    if (!raw) continue;

    const q = readSection(raw, "Assigned Queue");
    const active = q["active now"];
    const status = (q["status"] ?? "").toLowerCase();
    const task = q["task / outcome"] ?? q["task"] ?? "";
    const working = /in.?progress|active|working|started/.test(status);

    let label = null;
    if (!isEmptyValue(active)) label = clip(active, 80);
    else if (working && task) label = clip(`Working on ${task}`, 80);
    if (!label) continue;

    const detail = [
      task && `Queue: ${task}.`,
      q["files / write scope"] && `Scope: ${q["files / write scope"]}.`,
      !isEmptyValue(q["current handoff"]) && `Handoff open: ${q["current handoff"]}.`,
    ]
      .filter(Boolean)
      .join(" ");

    states.push({ agentId, label, detail: clip(detail, 240) });
  }
  return states;
}

/** Who owns the plan, per the plan itself. */
async function planner() {
  const raw = await readIfPresent(path.join(AGENTS_DIR, "planning.md"));
  const who = raw && readPreamble(raw, "Last updated by");
  return who ? who.toLowerCase().split(/[\s,(]/)[0] : null;
}

/**
 * Best-effort attribution for a handoff.
 *
 * `From:` is prose — "Claude (UI lane)", "Codex" — so it maps to a Cohort agent
 * only sometimes. When it does not, the handoff is skipped rather than pinned
 * on whoever sounds closest. A wrong name on a status line is worse than none.
 */
async function handoffEvent(file, knownIds) {
  const raw = await readIfPresent(file);
  if (!raw) return null;
  const from = (readPreamble(raw, "From") ?? "").toLowerCase();
  const agentId = knownIds.find((id) => from.includes(id));
  if (!agentId) return null;
  const title = raw.match(/^#\s*(.+)$/m)?.[1] ?? path.basename(file, ".md");
  return {
    agentId,
    label: "Filing a handoff...",
    detail: clip(`${title}. To: ${readPreamble(raw, "To") ?? "unassigned"}.`, 240),
  };
}

async function post({ agentId, label, detail }, channelId) {
  let res;
  try {
    res = await fetch(`${BASE}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-cohort-secret": SECRET },
      body: JSON.stringify({ channelId, agentId, label, detail }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    // Cohort is down, restarting, or slow. Keep sweeping — the next one
    // reconnects, and a watcher that exits because the app blinked is a worse
    // tool than one that waits.
    // One tag for the whole app, not one per channel: it is the same outage.
    warnOnce("unreachable", `Cannot reach ${BASE}: ${err instanceof Error ? err.message : err}`);
    return false;
  }

  if (res.status === 202) return true;
  if (res.status === 503) {
    console.error("Cohort has no COHORT_EVENTS_SECRET set — the ingest is switched off there.");
    process.exit(1);
  }
  if (res.status === 401) {
    console.error("Rejected: this script's COHORT_EVENTS_SECRET does not match Cohort's.");
    process.exit(1);
  }
  // A 400 means Cohort does not know this agent or channel. Say so once and
  // keep going — one unmapped worker should not stop the rest reporting.
  warnOnce(
    `${agentId}:${channelId}:${res.status}`,
    `Skipping ${agentId} in #${channelId}: ${res.status} ${clip(await res.text(), 120)}`
  );
  return false;
}

async function publish(status) {
  // The agent's own channel and the team room. Someone watching #augustus and
  // someone watching #cohort are asking the same question from two places.
  const sent = await post(status, status.agentId);
  if (sent) await post(status, TEAM_CHANNEL);
  return sent;
}

let lastReport = null;
let sweeping = false;

async function sweep(events = []) {
  // Sweeps must not stack. A slow one already delays the feed; overlapping ones
  // post the same statuses several times over and hide which is current.
  if (sweeping) return;
  sweeping = true;
  try {
    await runSweep(events);
  } finally {
    sweeping = false;
  }
}

async function runSweep(events) {
  const states = await readWorkerStates();
  for (const state of states) await publish(state);
  for (const event of events) await publish(event);

  const report = states.length
    ? states.map((s) => `${s.agentId}: ${s.label}`).join(" | ")
    : "no agent reporting active work";
  if (report !== lastReport) {
    lastReport = report;
    console.log(`[${new Date().toLocaleTimeString()}] ${report}`);
    // A report that recovers should be able to complain again if it breaks
    // twice, so the once-only warnings reset when the picture actually changes.
    warned.clear();
  }
}

async function main() {
  if (!SECRET) {
    console.error("Set COHORT_EVENTS_SECRET to the same value Cohort is running with.");
    process.exit(1);
  }
  if (!fs.existsSync(AGENTS_DIR)) {
    console.error(`No Agents/ directory under ${ROOT}. Set HARNESS_ROOT to a harness install.`);
    process.exit(1);
  }

  console.log(`Watching ${AGENTS_DIR}\nReporting to ${BASE}/api/events`);
  await sweep();
  if (ONCE) return;

  const knownIds = (await readWorkerStates()).map((s) => s.agentId);
  const plannerId = await planner();
  const roster = [...new Set([...knownIds, plannerId].filter(Boolean))];

  let timer = null;
  const pending = new Set();

  // Recursive watch is the one platform-specific bet here; where it is not
  // available the refresh sweep still carries state, just less promptly.
  let watcher;
  try {
    watcher = fs.watch(AGENTS_DIR, { recursive: true });
  } catch {
    console.warn("Recursive watch unavailable — falling back to the refresh interval only.");
  }

  if (watcher) {
    watcher.on("change", (_type, filename) => {
      if (!filename || !String(filename).endsWith(".md")) return;
      pending.add(String(filename));
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const touched = [...pending];
        pending.clear();

        const events = [];
        for (const rel of touched) {
          if (rel === "planning.md" && plannerId) {
            events.push({
              agentId: plannerId,
              label: "Updating the plan...",
              detail: "Agents/planning.md changed — the planner is rewriting current product truth.",
            });
          }
          if (rel.startsWith("handoffs/") && !/README|TEMPLATE/i.test(rel)) {
            const event = await handoffEvent(path.join(AGENTS_DIR, rel), roster);
            if (event) events.push(event);
          }
        }
        await sweep(events);
      }, DEBOUNCE_MS);
    });
  }

  setInterval(() => void sweep(), REFRESH_MS);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
