import { AGENTS, AGENT_ORDER, CHANNELS, getParticipant, type AgentId } from "./agents";
import { getAllEntries, type TimelineEntry } from "./timeline";
import { getMessages } from "./messages";

/**
 * Search and question answering over the project record.
 *
 * Deliberately deterministic: every answer is assembled from real entries and
 * cites them. There is no model here. That means it can be wrong by being
 * narrow, but it can never be wrong by inventing — which matters for a product
 * whose whole claim is that the record is trustworthy.
 */

export type ResultKind = "agent" | "channel" | "entry" | "message";

export interface SearchResult {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  /** Higher sorts first. */
  score: number;
}

export interface Answer {
  /** One-line reply, written from the data. */
  summary: string;
  /** The entries the answer is drawn from. */
  citations: SearchResult[];
}

export interface SearchResponse {
  answer: Answer | null;
  results: SearchResult[];
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

// A length cutoff would drop meaningful short terms like "ux" or "md", so
// filter by stopword instead.
const STOPWORDS = new Set([
  "the","a","an","and","or","of","to","in","on","for","is","are","was","were",
  "did","do","does","we","i","it","he","she","they","what","who","why","when",
  "how","that","this","has","have","had","been","get","got","by","at","with",
]);

function tokens(s: string): string[] {
  return norm(s)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function entryResult(e: TimelineEntry): SearchResult {
  const who = getParticipant(e.agentId)?.name ?? e.agentId;
  const bits = [who, e.kind === "task" ? "shipped" : e.kind, e.date];
  if (e.verdict) bits.push(e.verdict);
  return {
    kind: "entry",
    id: e.id,
    title: e.title,
    subtitle: bits.join(" · "),
    href: `/agent/${e.agentId}`,
    score: 0,
  };
}

function scoreText(haystack: string, qs: string[]): number {
  const h = norm(haystack);
  let s = 0;
  for (const t of qs) {
    if (!h.includes(t)) continue;
    s += 1;
    // Whole-word and prefix matches beat mid-word coincidences.
    if (new RegExp(`\\b${t}`).test(h)) s += 1;
  }
  return s;
}

/** Which agent, if any, is the query about? */
function subjectAgent(q: string): AgentId | null {
  const n = norm(q);
  return AGENT_ORDER.find((id) => n.includes(id) || n.includes(norm(AGENTS[id].name))) ?? null;
}

function answerFor(q: string, entries: TimelineEntry[]): Answer | null {
  const n = norm(q);
  const qs = tokens(q);
  const who = subjectAgent(q);
  const of = (list: TimelineEntry[]) => (who ? list.filter((e) => e.agentId === who) : list);
  const name = who ? AGENTS[who].name : null;

  const asks = (...words: string[]) => words.some((w) => n.includes(w));

  // What went wrong / was sent back
  if (asks("wrong", "revise", "rejected", "fail", "mistake", "miss")) {
    const revised = of(entries.filter((e) => e.verdict === "Revise"));
    if (revised.length) {
      const e = revised[0];
      const fixes = e.fixes?.length ? ` ${e.fixes.length} specific fixes were assigned back.` : "";
      return {
        summary: `${name ?? "The team"} had "${e.title}" returned as Revise by ${
          e.reviewer ? AGENTS[e.reviewer].name : "a reviewer"
        } on ${e.date}.${fixes}`,
        citations: revised.map(entryResult),
      };
    }
    if (who) {
      return {
        summary: `${name} has no Revise verdicts on the record — every review passed.`,
        citations: of(entries.filter((e) => e.kind === "review")).map(entryResult),
      };
    }
  }

  // Promotions / growth
  if (asks("promot", "grow", "senior", "level", "career")) {
    const proms = of(entries.filter((e) => e.kind === "promotion"));
    if (proms.length) {
      const e = proms[0];
      return {
        summary: `${getParticipant(e.agentId)?.name} was promoted ${e.from} → ${e.to} on ${e.date}. ${e.detail}`,
        citations: proms.map(entryResult),
      };
    }
    if (who) {
      return {
        summary: `${name} has no promotion on the record yet.`,
        citations: [],
      };
    }
  }

  // Lessons
  if (asks("lesson", "learn", "memory", "remember")) {
    const lessons = of(entries.filter((e) => e.kind === "lesson"));
    if (lessons.length) {
      return {
        summary: `${name ?? "The team"} logged ${lessons.length} lesson${
          lessons.length === 1 ? "" : "s"
        }. Most recent: "${lessons[0].title}".`,
        citations: lessons.map(entryResult),
      };
    }
  }

  // Shipped work
  if (asks("ship", "built", "build", "deliver", "work on", "worked on", "doing")) {
    const shipped = of(entries.filter((e) => e.kind === "task"));
    if (shipped.length) {
      return {
        summary: `${name ?? "The team"} shipped ${shipped.length} item${
          shipped.length === 1 ? "" : "s"
        }. Most recent: "${shipped[0].title}" (${shipped[0].date}).`,
        citations: shipped.map(entryResult),
      };
    }
  }

  // Decisions. Prefer the specific decision the question is about over a count.
  if (asks("decid", "decision", "why did", "why do", "chose", "choose", "reason")) {
    const decisions = entries.filter((e) => e.kind === "decision" || e.kind === "brief");
    if (decisions.length) {
      const ranked = decisions
        .map((e) => ({ e, s: scoreText(`${e.title} ${e.detail} ${e.artifact ?? ""}`, qs) }))
        .sort((a, b) => b.s - a.s);
      const best = ranked[0];
      if (best.s >= 2) {
        return {
          summary: `${best.e.detail} — decided by ${
            getParticipant(best.e.agentId)?.name ?? best.e.agentId
          } on ${best.e.date}.`,
          citations: [best.e, ...ranked.slice(1, 3).map((r) => r.e)].map(entryResult),
        };
      }
      return {
        summary: `${decisions.length} human decisions are on the record. Most recent: "${decisions[0].title}".`,
        citations: decisions.map(entryResult),
      };
    }
  }

  // Reviews performed
  if (asks("review")) {
    const reviews = of(entries.filter((e) => e.kind === "review"));
    if (reviews.length) {
      const passed = reviews.filter((e) => e.verdict !== "Revise").length;
      return {
        summary: `${name ?? "The team"} has ${reviews.length} review${
          reviews.length === 1 ? "" : "s"
        } on the record, ${passed} passed.`,
        citations: reviews.map(entryResult),
      };
    }
  }

  // Who is X — also covers typing just the name.
  const bareName = who !== null && norm(q).replace(norm(AGENTS[who].name), "").trim().length <= 3;
  if (who && (bareName || asks("who is", "who's", "what does", "tell me about"))) {
    const a = AGENTS[who];
    return {
      summary: `${a.name} — ${a.title}. ${a.blurb}`,
      citations: of(entries).slice(0, 4).map(entryResult),
    };
  }

  return null;
}

export async function search(query: string): Promise<SearchResponse> {
  const q = query.trim();
  if (!q) return { answer: null, results: [] };

  const qs = tokens(q);
  const entries = getAllEntries();
  const results: SearchResult[] = [];

  for (const id of AGENT_ORDER) {
    const a = AGENTS[id];
    const score = scoreText(`${a.name} ${a.title} ${a.blurb}`, qs);
    if (score > 0) {
      results.push({
        kind: "agent",
        id,
        title: a.name,
        subtitle: a.title,
        href: `/agent/${id}`,
        score: score + 1,
      });
    }
  }

  for (const c of CHANNELS) {
    const score = scoreText(`${c.name} ${c.description}`, qs);
    if (score > 0) {
      results.push({
        kind: "channel",
        id: c.id,
        title: c.name,
        subtitle: c.description,
        href: `/c/${c.id}`,
        score,
      });
    }
  }

  for (const e of entries) {
    const score = scoreText(
      `${e.title} ${e.detail} ${(e.fixes ?? []).join(" ")} ${e.artifact ?? ""}`,
      qs
    );
    if (score > 0) results.push({ ...entryResult(e), score });
  }

  for (const channel of CHANNELS) {
    const messages = await getMessages(channel.id);
    for (const m of messages) {
      const score = scoreText(m.text, qs);
      if (score > 0) {
        results.push({
          kind: "message",
          id: m.id,
          title: m.text.slice(0, 90) + (m.text.length > 90 ? "…" : ""),
          subtitle: `${m.authorName} in ${channel.name}`,
          href: `/c/${channel.id}`,
          score,
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  return { answer: answerFor(q, entries), results: results.slice(0, 24) };
}
