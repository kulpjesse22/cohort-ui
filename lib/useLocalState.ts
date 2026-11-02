"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A value kept in localStorage and shared by every component that reads the
 * same key, in this tab and others. The server renders the fallback; the
 * stored value takes over after hydration.
 *
 * `parse` validates what comes back, so a stale or hand-edited entry falls
 * back rather than breaking the page.
 */

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

export function readLocal<T>(key: string, fallback: T, parse: (raw: unknown) => T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return (cache.get(key)?.value as T) ?? fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value = fallback;
  if (raw !== null) {
    try {
      value = parse(JSON.parse(raw));
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeLocal<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  try {
    localStorage.setItem(key, raw);
  } catch {
    // Private mode or a full quota: hold it for this page only.
  }
  cache.set(key, { raw, value });
  emit(key);
}

export function useLocalState<T>(key: string, fallback: T, parse: (raw: unknown) => T) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const set = listeners.get(key) ?? new Set();
      set.add(cb);
      listeners.set(key, set);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) cb();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key]
  );
  const value = useSyncExternalStore(
    subscribe,
    () => readLocal(key, fallback, parse),
    () => fallback
  );
  const set = useCallback((next: T) => writeLocal(key, next), [key]);
  return [value, set] as const;
}

/** Open/closed flags by id, for collapsible groups. */
export function parseFlags(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw)) if (typeof v === "boolean") out[k] = v;
  return out;
}
