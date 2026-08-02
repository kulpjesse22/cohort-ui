import { AGENTS, AGENT_ORDER, type AgentId } from "./agents";

/**
 * In-character agent replies.
 *
 * Deterministic, not generated — there is no model behind this. Each reply is
 * built from the agent's actual role constraints in `Agents/*.md`, and always
 * names the durable artifact the agent would write. That last part matters: an
 * agent that answers in chat and leaves nothing behind is exactly the failure
 * this product exists to fix, so the reply says where the answer would land.
 *
 * These are stances, not claims of completed work. Nothing here asserts that a
 * file was written.
 */

type Intent = "greeting" | "request" | "question" | "review" | "statement";

function classify(text: string): Intent {
  const t = text.toLowerCase().trim();
  if (/^(hi|hey|hello|yo|morning|good morning)\b/.test(t)) return "greeting";
  // Specific intents win over the generic question test: "can you review this?"
  // is a review request, not a question about reviews.
  if (/\b(review|critique|check|look at|feedback|audit)\b/.test(t)) return "review";
  if (/\?\s*$/.test(t) || /^(what|why|how|when|who|where|can|could|should|is|does|do)\b/.test(t))
    return "question";
  if (/\b(build|make|add|create|implement|fix|ship|change|update|write)\b/.test(t))
    return "request";
  return "statement";
}

/** Who should answer in this channel, given the text and any @mention. */
export function responder(channelId: string, text: string): AgentId | null {
  const mentioned = AGENT_ORDER.find((id) =>
    new RegExp(`@${id}\\b`, "i").test(text)
  );
  if (mentioned) return mentioned;
  if (AGENTS[channelId as AgentId]) return channelId as AgentId;
  // #design-crit has no single owner; the design director takes point.
  if (channelId === "design-crit") return "hephaestus";
  return null;
}

const REPLIES: Record<AgentId, Record<Intent, string>> = {
  claudia: {
    greeting:
      "Morning. If you have work to assign, give me the outcome and the constraint and I'll turn it into a queue. I don't assign anything ambiguous.",
    request:
      "I can sequence that. Before I assign it I need the acceptance criteria and whether it touches anyone's existing write scope — if two workers would edit the same file, it goes to one queue, not two. I'd record the plan in planning.md.",
    question:
      "Current truth lives in planning.md — that's the file to trust over anything I say here. If what you're asking isn't in it yet, that's a gap I should close rather than answer from memory.",
    review:
      "Review isn't mine. Athena takes enterprise product-design, Hephaestus takes interface craft. I can route it and record the handoff, but I don't judge the work myself.",
    statement:
      "Noted. If that's a durable decision rather than a passing preference, say so and I'll log it — otherwise it stays in this thread and won't survive the session.",
  },
  augustus: {
    greeting:
      "Ready. My scope comes from tasks/augustus.md, so point me at what's queued rather than describing it here.",
    request:
      "I can take that if it's inside my write scope. If it isn't, I stop and report rather than widening — that's the rule, not politeness. Give me the failure path along with the happy path and I'll build both.",
    question:
      "I'd check the task doc and the handoff before answering — guessing is how you end up with a confidently wrong build.",
    review:
      "I don't review my own work; that's the whole point of splitting execution from judgment. Athena or Hephaestus would take it once it's built.",
    statement:
      "Understood. If that changes the assumption my current task rests on, I'd flag it to Claudia rather than quietly adjusting.",
  },
  julius: {
    greeting:
      "Here. Scope comes from tasks/julius.md — happy to pick up whatever's queued.",
    request:
      "Before I build UI I read design.md and UX.md, and I want the state model up front: empty, loading, error, disabled, permission. Learned that one the hard way — it's written down in lessons/.",
    question:
      "Let me check the design contract before I answer. If it isn't specified there, that's a question for Hephaestus rather than something I should invent.",
    review:
      "Not mine to call. I'd rather have it sent back with specific fixes than approved vaguely — the specific version is what actually made me better.",
    statement:
      "Got it. If it conflicts with the design contract I'm building against, I'll raise it instead of picking one silently.",
  },
  athena: {
    greeting:
      "Hello. Point me at a specific artifact and I'll review it — I work to the scope you give me, not the whole product.",
    request:
      "I don't build. I review what's been produced and assign the fixes back to whoever produced it, through a handoff — that's the only way the correction survives.",
    question:
      "I'd answer that against design.md and UX.md rather than preference. If those two disagree with each other, that's a conflict to surface, not resolve quietly.",
    review:
      "I'd check it against the guides and every required state — empty, loading, error, disabled, permission, no-results, long-content, many-record. Then a verdict with specific fixes, written to handoffs/. Vague findings just cause rework.",
    statement:
      "Noted. If that's a durable stance on density or hierarchy rather than a one-off, it belongs in the decision log, not this thread.",
  },
  hephaestus: {
    greeting:
      "Hello. Tell me the user's goal and the situation and I'll design the answer, not a list of options.",
    request:
      "I'll give you a direction rather than a questionnaire: placement, exact copy, behaviour, and every state. It'd land in designs/ as a contract a builder can implement without guessing.",
    question:
      "I'd answer through the design guide and the human-interface principles. If it changes product intent rather than craft, that's your call and not mine.",
    review:
      "I'd compare the build against the design contract and prescribe exact corrections — blocking, should-fix, polish. Not 'improve hierarchy'; the specific structure that creates the quality.",
    statement:
      "Understood. If that's a lasting constraint on interaction or vocabulary, it should go into UX.md so the next session inherits it.",
  },
};

export interface GeneratedReply {
  agentId: AgentId;
  text: string;
}

export function replyTo(channelId: string, text: string): GeneratedReply | null {
  const agentId = responder(channelId, text);
  if (!agentId) return null;
  return { agentId, text: REPLIES[agentId][classify(text)] };
}
