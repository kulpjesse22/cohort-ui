"use client";

import { useEffect, useState } from "react";

/**
 * A cited file path, made openable.
 *
 * Every timeline entry names the artifact it produced. Leaving those as dead
 * text undercuts the product's central claim — that the record lives in the
 * repository. Clicking one reads the actual file off disk.
 */

interface Doc {
  path: string;
  content: string | null;
  exists: boolean;
}

export function ArtifactLink({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || doc) return;
    setLoading(true);
    fetch(`/api/doc?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((d) => setDoc(d))
      .catch(() => setDoc({ path, content: null, exists: false }))
      .finally(() => setLoading(false));
  }, [open, doc, path]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Open ${path}`}
        className="group inline-flex max-w-full items-center gap-1 font-mono text-[10px] text-ink-4 transition-colors hover:text-ink-2"
      >
        <span className="truncate underline decoration-line-strong decoration-dotted underline-offset-2">
          {path}
        </span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <path
            d="M4.5 2.5h5v5M9.5 2.5 5 7M8 9.5H2.5V4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[8vh]">
          <button
            aria-label="Close document"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={path}
            className="relative flex max-h-[78vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line-strong bg-canvas shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink">
                {path}
              </span>
              {doc && (
                <span
                  className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] ${
                    doc.exists
                      ? "border-approved-line bg-approved-bg text-approved"
                      : "border-line-strong text-ink-3"
                  }`}
                >
                  {doc.exists ? "in the repo" : "not written"}
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded p-1 text-ink-3 transition-colors hover:bg-hover hover:text-ink"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="m3.5 3.5 7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {loading && <p className="text-[13px] text-ink-3">Reading from disk…</p>}

              {!loading && doc?.exists && (
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-ink-2">
                  {doc.content}
                </pre>
              )}

              {!loading && doc && !doc.exists && (
                <div className="rounded-lg border border-dashed border-line px-4 py-6 text-center">
                  <p className="text-[13px] font-semibold text-ink">
                    This file isn&apos;t in the repository
                  </p>
                  <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-3">
                    It belongs to the seeded history that demonstrates the growth
                    arc. Entries from real sessions cite files that do exist —
                    open one of the <span className="font-mono text-[11px]">Agents/</span>{" "}
                    paths to see the difference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
