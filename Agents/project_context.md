# Project Context

<!--
## How To Use This File

- Use this file for durable project context only.
- Update it when the product shape, system boundaries, stack, or non-negotiable rules change.
- Do not use this file as a sprint log, task tracker, or session summary.
-->

Shared high-level context for all agents. This file is intentionally architectural and durable. It should not be used as a sprint log, status board, or session history.

## 1. Purpose

Cohort is a workspace interface for [HAI-Harness](https://github.com/ClaudiusMa/HAI-Harness).

The harness is a repo-as-truth collaboration layer: named agent roles, task contracts, handoffs, and lessons, all living as markdown in a repository. It works, but it is invisible — you experience it as a folder of files.

Cohort makes it something you can see and talk to. Each role gets a channel, each agent gets a profile with a track record, and the repository files that govern the work sit alongside the conversation instead of being buried.

This repo has the harness installed at its own root. The `Agents/` folder you are reading is the same one the app displays.

## 2. What this is not

- Not a replacement for the harness. Cohort renders it; the markdown stays the source of truth.
- Not a chat wrapper around a model. There is no live agent backend yet.
- Not finished. Work in progress, published to gather feedback.

## 3. Current state

Working today:

- Channels per role plus `#design-crit`, with seeded conversation and a composer whose messages persist locally.
- A pinned context rail that reads this repository's markdown live from disk.
- Agent profiles at `/agent/[id]`: tasks shipped, reviews with verdicts and the specific fixes returned, lessons logged, seniority promotions.
- A guided tour at `/demo` that walks the full loop.

Mocked or absent:

- Conversation content is seeded. Nothing is wired to a running agent.
- Timeline history is seeded, not derived from `handoffs/` or `lessons/`.
- Seniority labels are static placeholders, flagged as such in the UI.

## 4. Architectural stance

- **The repository is the source of truth.** Anything durable is a file. The context rail reads real files rather than a database, so what the UI shows and what an agent would read on its next turn cannot drift apart.
- **Roles have fixed scope.** The five agents are not interchangeable. Their boundaries come from `Agents/*.md`; the UI reflects them rather than inventing its own.
- **Execution and judgment are separate.** Builders build, reviewers approve. The UI makes review outcomes visible instead of implicit.

## 5. Constraints

- Next.js App Router, TypeScript, Tailwind. No component library.
- Reads the harness from `process.cwd()`, overridable with `HARNESS_ROOT`.
- No external network calls at runtime. The app reads local files only.
