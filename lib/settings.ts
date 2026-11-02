import type { ActorId } from "./agents";

/**
 * Review settings. They live in this browser only: nothing here writes to the
 * repo, so a closed or archived handoff is a view of the record, not a change
 * to it. The settings page says so where the controls are.
 */

const DAY = 60 * 24;

export const STALE_OPTIONS = [
  { value: "3d", label: "3 days", minutes: 3 * DAY },
  { value: "1w", label: "1 week", minutes: 7 * DAY },
  { value: "2w", label: "2 weeks", minutes: 14 * DAY },
  { value: "1m", label: "1 month", minutes: 30 * DAY },
  { value: "3m", label: "3 months", minutes: 90 * DAY },
] as const;

export const ARCHIVE_OPTIONS = [
  { value: "1w", label: "1 week", minutes: 7 * DAY },
  { value: "1m", label: "1 month", minutes: 30 * DAY },
  { value: "3m", label: "3 months", minutes: 90 * DAY },
  { value: "6m", label: "6 months", minutes: 180 * DAY },
  { value: "never", label: "Never", minutes: null },
] as const;

/** What a stale handoff becomes. None of these is a verdict: only a reviewer issues one. */
export const STALE_STATUS_OPTIONS = [
  { value: "closed", label: "Closed as stale" },
  { value: "returned", label: "Returned to author" },
  { value: "parked", label: "Parked" },
] as const;

export const REVIEWER_OPTIONS: { value: ActorId; label: string }[] = [
  { value: "jesse", label: "Jesse (you)" },
  { value: "athena", label: "Athena" },
  { value: "hephaestus", label: "Hephaestus" },
];

export type StaleAfter = (typeof STALE_OPTIONS)[number]["value"];
export type ArchiveAfter = (typeof ARCHIVE_OPTIONS)[number]["value"];
export type StaleStatus = (typeof STALE_STATUS_OPTIONS)[number]["value"];

export interface ReviewSettings {
  autoClose: boolean;
  staleAfter: StaleAfter;
  staleStatus: StaleStatus;
  archiveAfter: ArchiveAfter;
  defaultReviewer: ActorId;
}

export const DEFAULT_SETTINGS: ReviewSettings = {
  autoClose: true,
  staleAfter: "2w",
  staleStatus: "closed",
  archiveAfter: "3m",
  defaultReviewer: "jesse",
};

export function staleMinutes(s: ReviewSettings): number {
  return STALE_OPTIONS.find((o) => o.value === s.staleAfter)!.minutes;
}

export function archiveMinutes(s: ReviewSettings): number | null {
  return ARCHIVE_OPTIONS.find((o) => o.value === s.archiveAfter)!.minutes;
}

export function labelOf<T extends { value: string; label: string }>(options: readonly T[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
