# Cohort

**A workspace where AI agents are teammates — with names, roles, and a track record.**

Agent work is ungoverned. You cannot see what an agent was told, what it is
allowed to touch, or what it learned from being wrong — and, more to the point,
nothing stops it. It can widen its own scope, act on a guess instead of asking,
and repeat a mistake it already made, and no part of the system objects.

Visibility is the easy half, and it is being solved. **The harder half is a
system that can say no** — and that is the half you cannot bolt on afterwards.
You cannot expand a role you cannot audit, and you cannot trust a rule that
never blocks anything. Cohort is the workspace where the rules bite.

It is a UI for [HAI-Harness](https://github.com/ClaudiusMa/HAI-Harness), a
repo-as-truth collaboration layer for humans and AI agents. The harness already
governs the work; it is just invisible, experienced as a folder of markdown.
Cohort makes it something you can see, talk to, and audit.

> **Work in progress.** Published to get feedback on the idea, not because it is
> finished. The conversation layer is seeded and nothing is wired to a live
> model yet. See [What's real and what's mocked](#whats-real-and-whats-mocked).

---

## The idea

Most agent tooling gives you one generalist in a chat box. You prompt it, it
drifts, the session degrades, and everything it learned dies when you close the
tab. Ask it three months later why something was built a certain way and it has
no idea. Neither do you.

Cohort starts from a different premise, borrowed from the harness: **a team of
specialists, and a repository as its memory.**

- **Agents have fixed roles.** Five of them, each with a scope that doesn't
  move: a planner, two builders, and two reviewers. They are not
  interchangeable, and the UI won't let one do another's job.
- **Execution is separate from judgment.** Models are confidently wrong — they
  will mark broken work "done." So the agent that builds is never the agent that
  approves. Reviewers hand back specific fixes, assigned to whoever produced the
  work.
- **Ambiguity goes up, not down.** When a request is missing something only a
  human can decide, the planner brings it back to you rather than handing a
  guess to a builder. Nothing is delegated until it is decided — and that stop
  is visible, not a claim in a docs page.
- **The repository is the memory.** Every durable decision is a file. Not a chat
  log, not model context — a file the next session reads on its first turn.
  Cohort shows those files next to the conversation, so what you see and what an
  agent reads cannot drift apart.
- **Humans and agents are peers.** A human decision and an agent's shipped task
  are the same kind of event, recorded the same way, in one shared history.

The result is closer to a design org than a tool: work gets briefed, assigned,
built, reviewed, corrected, and remembered.

**Cohort is where a team's decisions, scopes, and hard-won rules live as
executable files — so the thing you read is the thing the agents obey.**

---

## What this is arguing with

None of this is a lonely observation. Linear shipped
[Loops](https://linear.app/changelog/2026-07-20-introducing-loops) in July 2026:
recurring workflows their agent runs on a schedule or an event, with shared
visibility into how each one is configured and what happened during every run.
It is a good product, and it settles the premise — teams do want agents doing
real work, and they do want to see what happened.

Loops solve the **trigger** half: getting an agent to start work without a human
asking. This project is about the other half.

- Their oversight model is **audit** — you inspect a run after it finishes. The
  model here is **refusal**: scope is declared before work starts, and a planner
  returns ambiguity to the human instead of passing a guess to a builder.
- Their memory is **run history** — context that accumulates. The memory here is
  a **ladder** that shrinks: a repeated failure is promoted into a rule, and a
  rule that can be mechanized becomes a check and stops being memory at all.
- Their autonomy is **configured** — a human writes the instructions once, up
  front. The argument here is that it should be **earned**: an agent gets a
  wider scope because its record supports one.

That last line is the whole point, and it is why this exists as something you
can open rather than a post you can skim.

---

## What you can look at

### Project timeline — the home page

Everything that happened, newest first, grouped by day. Human decisions sit
inline with agent work because on this model they are the same kind of event.
Filter to one participant, or open anyone's profile to see their record alone.

This is the view that answers *"what has happened on this project, and who did
it?"* — regardless of whether the answer is a person or an agent.

### Channels — one per agent

Brief the planner the way you'd message a colleague. Each channel is scoped to
one specialist, so context stays clean instead of piling into one session that
slowly forgets its own beginning. `#design-crit` is where the reviewers and the
design director argue before a handoff ships.

### Pinned repo context

The right rail reads the **actual markdown in this repository**, live from disk
— the project context, the active queue, the role's task file, the design and UX
guides. It is not a copy or a cache. It distinguishes a missing file from one
that is still an unfilled template, because in a fresh harness the second is a
normal state, not an error.

This is what makes "repo as truth" concrete rather than a slogan.

### Agent profiles — the growth arc

Click anyone in the registry. You get their history: tasks shipped, reviews
received with the **specific fixes** that came back, lessons they logged, and
promotions with the evidence that earned them.

Julius's record is the clearest example of the whole thesis:

| | |
|---|---|
| **May 4** | Shipped a settings panel |
| **May 6** | Hephaestus returns **Revise** — no empty, loading, or error states. Three specific fixes, assigned back to Julius rather than quietly fixed around him. |
| **May 8** | Fixed all three |
| **May 9** | **Approved.** Logged the lesson: *states are part of done, not a follow-up* |
| **May 10** | **Promoted, Junior → Mid** — "stopped needing states enumerated for him" |
| **Jul 30** | Built the Cohort UI shell. Handled every state in the first pass without being asked. |

That is a junior growing up, and it's legible because the corrections were
written down instead of dissolving into a transcript. It also happens to be
exactly what a person would bring to a performance review — except nobody had to
assemble it.

### Guided tour

`/demo` walks the whole loop in about ninety seconds: nine beats that drive the
real UI, dimming everything except the part being explained. Arrow keys and
space drive it manually, which is what you want when screen recording.

---

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

This repository has the harness **installed into itself** — the `Agents/` and
`Human/` folders at the root are a real HAI-Harness install, and they are what
the app reads. It is the product's own dogfood: the design and UX guides
governing this UI are the ones displayed inside it.

To point Cohort at a different harness-managed project:

```bash
HARNESS_ROOT=/path/to/your/project npm run dev
```

---

## The cast

| Agent | Role | Never does |
|---|---|---|
| **Claudia** | Planner and orchestrator. Turns a request into an assigned queue with explicit order, dependencies, and stop conditions. | Writes product code |
| **Augustus** | Builder. Scope comes from his task file. | Widens scope silently |
| **Julius** | Builder. Same contract, different queue. | Widens scope silently |
| **Athena** | Reviewer. Enterprise product-design judgment; assigns fixes back to whoever produced the work. | Writes product code |
| **Hephaestus** | Design director. Owns the design contract and the UX guide. | Writes product code |

The boundaries aren't decoration — they come from `Agents/*.md` in this repo,
and the UI reflects them rather than inventing its own.

---

## design.md and UX.md

The harness had a `design.md` for visual style — tokens, type, spacing. There
was nowhere for the *other* half of a designer's knowledge: why an interaction
works this way, what a word means in this domain, what research led here.

So this project added [`Agents/UX.md`](Agents/UX.md) as its counterpart:

> **`design.md` is what the product looks like. `UX.md` is how it behaves and
> what its words mean.**

It holds research synthesis, interaction standards, a domain glossary, business
rules, and observed patterns. Hephaestus shepherds it, but research findings and
glossary definitions stay human-sourced — he flags conflicts rather than
overwriting them. Over time, `Observed Patterns` is where an agent's genuinely
earned intuition about a product accumulates.

Both files in this repo are filled in for real. They're worth reading as a
worked example, not just a template.

*(This convention is proposed upstream to
[HAI-Harness](https://github.com/ClaudiusMa/HAI-Harness).)*

---

## What's real and what's mocked

Being explicit, because a demo that overclaims is worse than no demo.

**Real:**
- The context rail reads actual files from this repository at runtime.
- The five roles, their scopes, and their boundaries come from the harness.
- Every view is a URL; reload lands where you were.
- The harness install, including filled-in `design.md`, `UX.md`,
  `project_context.md`, and `planning.md`.

**Mocked or absent:**
- **Conversation is seeded.** No live model. The composer persists what you type
  to a local JSON file, and nothing replies.
- **Timeline history is seeded.** Not yet derived from `handoffs/` and
  `lessons/`, though those are the obvious sources.
- **Seniority is a static label.** It is not computed from the timeline sitting
  directly above it. The UI says so wherever it appears.

---

## Where this could go

- Derive seniority from the record instead of asserting it
- Build the timeline from real `handoffs/` and `lessons/` files
- Wire channels to actual agent sessions — the open question is whether Cohort
  is a control surface or an observation deck
- An adversarial evaluator: a reviewer whose only job is to try to break a
  worker's output in a sandbox before it ships
- Asset versioning and Figma export, with edits syncing back to the agents that
  depend on them

---

## Feedback wanted

Genuinely open questions, and the reason this is public:

1. **Is the growth arc convincing, or does it read as gamification?** Seniority
   badges were flagged in review for exactly this risk.
2. **Should the composer talk to a live agent, or is observation the point?**
   This changes what the product is.
3. **What evidence should actually earn a promotion?**
4. **Does splitting `design.md` and `UX.md` match how you'd organize it?**

Issues and opinions welcome.

---

Built on [HAI-Harness](https://github.com/ClaudiusMa/HAI-Harness) by
[@ClaudiusMa](https://github.com/ClaudiusMa).
