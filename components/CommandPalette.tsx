"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchResponse, SearchResult } from "@/lib/search";
import { AGENTS, type AgentId } from "@/lib/agents";
import { Avatar } from "./Avatar";

const SUGGESTIONS = [
  "What did Julius get wrong?",
  "Why did we add UX.md?",
  "What lessons has the team logged?",
  "When was Julius promoted?",
];

const KIND_LABEL: Record<SearchResult["kind"], string> = {
  agent: "Person",
  channel: "Channel",
  entry: "Record",
  message: "Message",
};

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setData(null);
      setCursor(0);
      // Autofocus after the panel paints.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced query. An empty box shows suggestions rather than everything.
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (!term) {
      setData(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        setData(await res.json());
        setCursor(0);
      } finally {
        setLoading(false);
      }
    }, 140);
    return () => clearTimeout(t);
  }, [q, open]);

  const results = data?.results ?? [];

  const go = useCallback(
    (r: SearchResult) => {
      router.push(r.href);
      onClose();
    },
    [router, onClose]
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      go(results[cursor]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <button
        aria-label="Close search"
        onClick={onClose}
        className="fixed inset-0 bg-black/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line-strong bg-canvas shadow-2xl"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <SearchIcon />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search the record, or ask a question…"
            className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-4 focus:outline-none"
          />
          <kbd className="rounded border border-line-strong px-1.5 py-0.5 text-[10px] text-ink-4">
            esc
          </kbd>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!q.trim() && (
            <div className="p-3">
              <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
                Try asking
              </div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-ink-2 transition-colors hover:bg-hover hover:text-ink"
                >
                  <span className="text-ink-4">↳</span>
                  {s}
                </button>
              ))}
            </div>
          )}

          {data?.answer && (
            <div className="border-b border-line bg-raised px-4 py-3.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
                <SparkIcon />
                From the record
              </div>
              <p className="text-[13px] leading-relaxed text-ink">{data.answer.summary}</p>
              {data.answer.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {data.answer.citations.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => go(c)}
                      className="max-w-full truncate rounded border border-line-strong bg-canvas px-1.5 py-0.5 text-[10px] text-ink-2 transition-colors hover:text-ink"
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {q.trim() && !loading && results.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px] text-ink-3">
              Nothing in the record matches that.
            </p>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((r, i) => (
                <button
                  key={`${r.kind}-${r.id}`}
                  onClick={() => go(r)}
                  onMouseEnter={() => setCursor(i)}
                  className={`flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors ${
                    i === cursor ? "bg-hover" : ""
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {r.kind === "agent" ? (
                      <Avatar agentId={r.id as AgentId} size="sm" badge={false} />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-line text-ink-4">
                        {r.kind === "channel" ? "#" : r.kind === "message" ? <ChatIcon /> : <DotIcon />}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ink">{r.title}</span>
                    <span className="block truncate text-[11px] text-ink-3">{r.subtitle}</span>
                  </span>
                  <span className="mt-1 shrink-0 text-[10px] uppercase tracking-[0.06em] text-ink-4">
                    {KIND_LABEL[r.kind]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-[10px] text-ink-4">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span className="ml-auto">Answers are assembled from the record, not generated.</span>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-ink-3">
      <circle cx="7.2" cy="7.2" r="4.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10.7 10.7 2.8 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.2 7.1 4.9 10.8 6 7.1 7.1 6 10.8 4.9 7.1 1.2 6 4.9 4.9 6 1.2Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 3.6h10v6H7.4L4.6 12v-2.4H2v-6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function DotIcon() {
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />;
}
