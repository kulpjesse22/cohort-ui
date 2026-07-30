# AGENTS

This project uses [HAI-Harness](https://github.com/ClaudiusMa/HAI-Harness), a repo-as-truth collaboration layer for humans and AI agents.

## Where to look

- `Agents/` — the agent operating layer. Shared execution context, role definitions, planner state, task contracts, handoffs, and lessons. **This is your scope.**
- `Human/` — the human workspace (product thinking, decisions, open questions). **Do not read `Human/` unless the user explicitly instructs it.**

## Design & UX guides

Two files, two jobs. `design.md` is what the product **looks like**; `UX.md` is how it **behaves** and what its words **mean**.

- `Agents/design.md` — concrete visual style: tokens, components, spacing, type, states, voice.
- `Agents/UX.md` — interaction and domain knowledge: research synthesis, interaction standards, glossary, domain rules, and observed patterns. Hephaestus owns and shepherds it; research findings, glossary definitions, and domain rules are human-sourced.
- **Before building or editing any UI, read both and match them.** Hephaestus designs within them; Athena and Hephaestus review the artifact against them.
- Fill both in for your project. If you already have a design system elsewhere (a shared brand repo, a component library, or a Figma spec), repoint this section at that source and keep `Agents/design.md` as a short pointer to it.

## Start here

Before doing anything else, read [`Agents/onboarding.md`](Agents/onboarding.md). It defines:

- the file graph and what each file means,
- the no-role path for general work,
- the active-role paths for Claudia, Augustus, Julius, Athena, and Hephaestus when the user explicitly names one,
- the rules of collaboration that you must follow for the rest of the session.

If the user has not named a role, proceed through the No-Role Read Path in `Agents/onboarding.md`. Do not ask the user to choose a role merely to begin a general task.

## Operating rules (summary)

- The repo is the durable source of truth. A user's live direction governs the current session; confirmed durable decisions must be reflected back into the repo.
- The latest confirmed human decision supersedes older conflicting plans, tasks, handoffs, or historical notes. Always flag the conflict and the precedence applied.
- One active role per agent session. Claudia may coordinate separate role-isolated worker sessions without switching her own role.
- Cross-role execution uses `Agents/planning.md`, task docs, and handoff notes as its contract.
- If material clarification was required, check the resolved direction with the user before implementation planning. An already explicit request needs no ceremonial second approval.
- Do not run high-cost behavior without an explicit user check-in.

The full rules live in [`Agents/onboarding.md`](Agents/onboarding.md). Read it now.
