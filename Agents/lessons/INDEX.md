# Lessons Index

Last swept: 2026-08-17 — demo-transitions
Owner: Claudia, through `Agents/skills/lesson-logger/SKILL.md` only.

<!--
## How To Use This File

- This is the only always-loaded lesson memory: at most 25 entry lines plus the sweep cursor.
- Claudia scans it at new-task intake and routes only trigger-matching lesson files into worker contracts.
- Entry format: - [do|never] when {trigger} → {imperative}. ({file}.md · src {task} · fired {n})
-->

## Entries

- [do] when picking a TTS voice or minting an API key for a render → confirm tier eligibility and key scopes before writing narration against that voice. (elevenlabs-api-preconditions.md · src demo-video-tts · fired 2)
- [never] when animating a guided-tour surface → apply translate; geometry set on the way out must be undone on the way in, and the undoing is the swing. (tour-motion-reversal.md · src demo-transitions · fired 4)
- [do] when starting work that reads or renders this project's Agents/ docs → diff the installed copy against upstream HAI-Harness before trusting it. (harness-field-instance-drift.md · src lessons-panel · fired 1)

## Pending Tier 0 specs

- Scan tracked files and staged diffs for API-key-shaped strings and fail the commit on a hit; retires the secrets Standing Gate. (src demo-video-tts)
- LANDED as `scripts/check-tour-motion.mjs`: fails the build if any tour- rule contains translate. Retires the Tier 2 lesson below once wired into CI. (src demo-transitions)
