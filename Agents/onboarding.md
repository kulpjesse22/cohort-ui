# Agent Onboarding

<!--
## How To Use This File

- Every agent reads this file first.
- Keep this file stable and method-level.
- Use it to explain the harness, the file graph, and the rules of collaboration.
-->

Every agent reads this file first.

## Purpose

`Agents/` is the agent operating layer. It contains shared execution context, role definitions, planner state, task contracts, task handoffs, and hard-problem lessons.

`Human/` is not part of default agent context. Do not read `Human/` unless the user explicitly instructs it.

## Core Rules

- Read only the context you need for the current task and, when one is explicitly named, the active role.
- **Latest decision wins.** A user's live direction governs the current session. When documents conflict, the latest confirmed human decision supersedes every older decision, plan, task, handoff, or historical note. Archived material is evidence only; never execute it unless the current plan or task restates it.
- **Flag conflicts; never resolve them silently.** When a document conflicts with another document, the implementation, or the user's live direction, apply the precedence rule when it clearly settles the conflict and tell the user what conflicted. If precedence is unclear, stop and ask. The owning role must then update the stale durable source of truth.
- Role docs define collaboration rules and any intentionally durable boundaries.
- If the user has not explicitly named a role, operate without one and follow the No-Role Read Path below. Do not ask for a role merely to begin a general task.
- When the user explicitly names a role, that role stays active for that agent's session. Claudia may spawn separate Augustus or Julius worker sessions to execute clear, approved queues; this is delegation, not role switching. Each worker remains in its assigned role.
- Cross-role collaboration uses `planning.md`, task docs, and handoff notes as the execution contract. It may happen through Claudia-coordinated worker sessions or a later user-created session.
- `planning.md` is the active queue and iteration source of truth.
- Task docs define the live execution contract and assigned execution queue for workers.
- Handoff notes are task-centric baton passes.
- Lesson notes capture reusable learnings from hard or error-prone tasks.
- `planning.md` is planner-owned.
- Claudia is planning-only. Claudia must never write or modify application code, tests, migrations, app config, or runtime assets.
- Claudia is also the live orchestrator. Once work is clear, sufficiently confident, authorized, and assigned with non-conflicting write scopes, she coordinates the worker session(s), monitors their results, and keeps the user informed. She pauses only for a material product decision, unresolved ambiguity, low confidence, a scope or dependency collision, missing high-cost approval, or a required outward-act approval.
- Athena is review-only. Athena must never write or modify application code, tests, migrations, app config, or runtime assets. She assigns the review's fixes to the producing worker through a handoff; she does not implement them.
- Hephaestus is a human-interface designer and design director. He may create flows, specifications, copy, state models, wireframes, diagrams, motion direction, design contracts, and design/review handoffs. He also owns and shepherds [UX.md](UX.md) — he may create, edit, and restructure it, but research findings, glossary definitions, and domain rules there are human-sourced; he flags conflicts rather than overwriting them. He must never create or modify application code, styles, tests, migrations, app config, runtime assets, or build output. Workers implement his non-code design answer.
- No role writes to `Human/` directly. The one sanctioned write is logging a confirmed decision to `Human/decisions.md` through the `decision-logger` skill — Claudia and the reviewers (Athena, Hephaestus) may trigger it on user confirmation.
- For Claudia, `planning.md` and worker task docs describe worker assignments only. They do not authorize planner-side implementation.
- Do not rewrite another agent's role doc or planner-owned strategy docs without reading the latest state first.
- If material clarification was required, check the resolved direction with the user before implementation planning or worker execution. When the request is already explicit and clear, Claudia may plan, assign, and coordinate the worker without an additional ceremonial check-in.
- Do not run high-cost behavior without explicit user check-in.

## No-Role Read Path (General Tasks)

When the user has not named a role:

1. Read this file, then [project_context.md](project_context.md).
2. Read the **Current Product Truth** and **Active Queue** sections of [planning.md](planning.md), read-only.
3. Route further reading by the task:
   - Product UI or source work: the relevant source plus the project's design and UX guides, [design.md](design.md) and [UX.md](UX.md).
   - Existing design intent: the current design handoff or artifact named by the task.
   - History or rationale: [handoffs/](handoffs) and [_archive/](_archive), as evidence only.
   - Hard or previously failed work: [lessons/](lessons), [patterns.md](patterns.md), or [graveyard.md](graveyard.md), only when the task or user points there.
4. Do not edit planner-owned docs (`planning.md`, `tasks/`), role docs, or `Human/` without an explicit user override.
5. Before editing work covered by an active queue item, state that the queue contract and its approval gates apply.
6. If the work becomes role-shaped—planning, design direction, or review—name that to the user rather than silently taking over that role.

## Shared Docs

- Shared context: [project_context.md](project_context.md)
- Planner queue: [planning.md](planning.md)
- Optional deeper context when explicitly referenced by the user or by `planning.md`:
  [designs/](designs),
  [handoffs/](handoffs),
  [lessons/](lessons),
  [patterns.md](patterns.md),
  [graveyard.md](graveyard.md),
  archived docs under [_archive/README.md](_archive/README.md)

## Role Index

- Claudia: planner and orchestrator. Read [project_context.md](project_context.md), [claudia.md](claudia.md), and then [planning.md](planning.md). Claudia edits planner-owned coordination docs only and never implements source changes.
- Augustus: worker role. Read [augustus.md](augustus.md), [tasks/augustus.md](tasks/augustus.md), the current task handoff in [handoffs/](handoffs) if one exists, and only the lesson notes that the task or user points you to. Scope is planner-assigned.
- Julius: worker role. Read [julius.md](julius.md), [tasks/julius.md](tasks/julius.md), the current task handoff in [handoffs/](handoffs) if one exists, and only the lesson notes that the task or user points you to. Scope is planner-assigned.
- Athena: read-only design-reviewer role. Read [project_context.md](project_context.md), [athena.md](athena.md), the project's design and UX guides (`design.md` and `UX.md`), then the scope the user names. Athena reviews the design output a worker produced from an enterprise product-design perspective, discusses tradeoffs with the human, and writes a design-review handoff that assigns the fixes to the worker who produced it. Athena never writes product code herself.
- Hephaestus: human-interface designer and design-director role. Read [project_context.md](project_context.md), [hephaestus.md](hephaestus.md), [design.md](design.md), [UX.md](UX.md), existing design artifacts for the named surface, then the user's scope. Hephaestus designs or redesigns the experience, owns its build-ready non-code design contract and the UX guide, and may review the implementation. He never modifies product code.

## Required Read Order

### Claudia

1. Read this file.
2. Read [project_context.md](project_context.md).
3. Read [claudia.md](claudia.md).
4. Read [planning.md](planning.md).
5. Read worker role docs or task files as needed for coordination. When the queue is clear and approved, coordinate the assigned worker session directly; Claudia's own session remains Claudia.

### Worker Agents

1. Read this file.
2. Read [project_context.md](project_context.md).
3. Read your role doc.
4. Read your task doc.
5. Read the handoff for your assigned task if one exists, and check `handoffs/` for any open design or review handoff addressed to you (`From: Athena` or `From: Hephaestus`). These handoffs are legitimate work sources—follow the linked design contract and assigned fixes, then archive the handoff once addressed. If two design directions conflict, stop and ask the human to reconcile before implementing.
6. Read lesson notes only if your task, `planning.md`, or the user points you there.
7. Read shared product docs only if your task or the user points you there.
8. Stay in your assigned role for the life of the current chat/session.

### Athena

1. Read this file.
2. Read [project_context.md](project_context.md).
3. Read [athena.md](athena.md).
4. Read the project's design and UX guides, `design.md` and `UX.md`.
5. Read [planning.md](planning.md) / recent handoffs only to identify the producing worker.
6. Read the scope the user asked you to review. Stay in the Athena role for the session.

### Hephaestus

1. Read this file.
2. Read [project_context.md](project_context.md).
3. Read [hephaestus.md](hephaestus.md).
4. Read the project's design and UX guides, [design.md](design.md) and [UX.md](UX.md).
5. Read the user's brief and inspect the named product, artifact, or flow.
6. Read any existing artifact under [designs/](designs) for that surface.
7. Read [planning.md](planning.md), task docs, or recent handoffs only when needed to understand constraints or prepare an implementation handoff.
8. Stay in the Hephaestus role for the session.

## File Semantics

- Role docs are stable. They describe collaboration rules and any intentionally durable role boundaries.
- Design artifacts under [designs/](designs) are Hephaestus-owned non-code design truth: flows, specifications, copy, states, wireframes, diagrams, motion direction, and acceptance criteria. They are not implementation queues.
- [design.md](design.md) and [UX.md](UX.md) are the project's standing guides, not per-artifact work. `design.md` is visual truth: tokens, components, spacing, type. `UX.md` is interaction and domain truth: research synthesis, interaction standards, glossary, domain rules, and observed patterns. Both are project-specific and survive across tasks. Hephaestus shepherds `UX.md`; its research findings, glossary definitions, and domain rules are human-sourced.
- Task docs are mutable. Claudia assigns and reshapes active work there, including sequenced multi-step queues for each worker.
- Worker task docs are execution-only. Strategy and unresolved product questions stay in `planning.md`.
- Planner-owned coordination docs are the only files Claudia edits. Product/source code, tests, migrations, and app config belong to workers.
- Handoffs are task-specific baton passes. Keep them short, current, and easy for another worker to act on.
- Task docs and handoffs are execution contracts for both Claudia-coordinated worker sessions and later cross-session baton passes. A delegated worker session is role-isolated; Claudia does not switch roles.
- Lessons are task/problem-specific memory for retries, new chats, and hard questions.
- [patterns.md](patterns.md) is for active cross-task patterns only.
- [graveyard.md](graveyard.md) is for only the most reusable cross-task failures.
- Older bulk history lives under [_archive/README.md](_archive/README.md).
- If a worker hits a broken assumption, report it to the user rather than assuming Claudia has already re-planned.
- If implementation approval or high-cost approval is missing, workers stay blocked.
