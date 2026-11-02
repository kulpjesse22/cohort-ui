"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  ARCHIVE_OPTIONS,
  DEFAULT_SETTINGS,
  REVIEWER_OPTIONS,
  STALE_OPTIONS,
  STALE_STATUS_OPTIONS,
  type ReviewSettings,
} from "./settings";

const KEY = "cohort-review-settings";

function pick<T extends string>(options: readonly { value: T }[], v: unknown, fallback: T): T {
  return options.some((o) => o.value === v) ? (v as T) : fallback;
}

function parse(raw: string | null): ReviewSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const v = JSON.parse(raw) as Partial<Record<keyof ReviewSettings, unknown>>;
    return {
      autoClose: typeof v.autoClose === "boolean" ? v.autoClose : DEFAULT_SETTINGS.autoClose,
      staleAfter: pick(STALE_OPTIONS, v.staleAfter, DEFAULT_SETTINGS.staleAfter),
      staleStatus: pick(STALE_STATUS_OPTIONS, v.staleStatus, DEFAULT_SETTINGS.staleStatus),
      archiveAfter: pick(ARCHIVE_OPTIONS, v.archiveAfter, DEFAULT_SETTINGS.archiveAfter),
      defaultReviewer: pick(REVIEWER_OPTIONS, v.defaultReviewer, DEFAULT_SETTINGS.defaultReviewer),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// useSyncExternalStore needs a stable snapshot, so the parsed value is cached
// against the raw string it came from.
let cachedRaw: string | null | undefined;
let cached: ReviewSettings = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

function read(): ReviewSettings {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cached;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: ReviewSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or a full quota: the setting holds for this page only.
    cachedRaw = JSON.stringify(next);
    cached = next;
  }
  listeners.forEach((l) => l());
}

export function useReviewSettings() {
  const settings = useSyncExternalStore(subscribe, read, () => DEFAULT_SETTINGS);
  const update = useCallback((patch: Partial<ReviewSettings>) => write({ ...read(), ...patch }), []);
  const reset = useCallback(() => write(DEFAULT_SETTINGS), []);
  return { settings, update, reset };
}
