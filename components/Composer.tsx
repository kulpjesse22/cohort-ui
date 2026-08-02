"use client";

import { useMemo, useRef, useState } from "react";
import { AGENT_ORDER, AGENTS } from "@/lib/agents";
import { Avatar } from "./Avatar";

/** Wraps the selection in `token`, or inserts a placeholder if nothing is selected. */
function wrapSelection(el: HTMLTextAreaElement, token: string, placeholder: string) {
  const { selectionStart: a, selectionEnd: b, value } = el;
  const chosen = value.slice(a, b) || placeholder;
  const next = value.slice(0, a) + token + chosen + token + value.slice(b);
  const caret = a + token.length + chosen.length;
  return { next, caret };
}

export function Composer({
  channelName,
  onSend,
}: {
  channelName: string;
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentionAt, setMentionAt] = useState<number | null>(null);
  const [mentionCursor, setMentionCursor] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Mention list opens on "@" and filters as you type, until whitespace ends it.
  const mentionQuery = useMemo(() => {
    if (mentionAt === null) return null;
    const after = text.slice(mentionAt + 1);
    if (/\s/.test(after)) return null;
    return after.toLowerCase();
  }, [text, mentionAt]);

  const matches = useMemo(() => {
    if (mentionQuery === null) return [];
    return AGENT_ORDER.filter((id) => id.startsWith(mentionQuery)).slice(0, 5);
  }, [mentionQuery]);

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function update(value: string, caret?: number) {
    setText(value);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      resize(el);
      if (caret !== undefined) el.setSelectionRange(caret, caret);
      el.focus();
    });
  }

  function applyFormat(token: string, placeholder: string) {
    const el = ref.current;
    if (!el) return;
    const { next, caret } = wrapSelection(el, token, placeholder);
    update(next, caret);
  }

  function pickMention(id: string) {
    if (mentionAt === null) return;
    const before = text.slice(0, mentionAt);
    const after = text.slice(mentionAt + 1 + (mentionQuery?.length ?? 0));
    const inserted = `@${id} `;
    setMentionAt(null);
    update(before + inserted + after, (before + inserted).length);
  }

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(trimmed);
      setText("");
      if (ref.current) ref.current.style.height = "auto";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (matches.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionCursor((c) => Math.min(c + 1, matches.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionCursor((c) => Math.max(c - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickMention(matches[mentionCursor]);
        return;
      }
      if (e.key === "Escape") {
        setMentionAt(null);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="safe-b safe-x px-4 pt-1 lg:px-6 lg:pb-4">
      <div className="relative">
        {matches.length > 0 && (
          <div className="absolute bottom-full left-0 z-20 mb-2 w-64 overflow-hidden rounded-lg border border-line-strong bg-canvas py-1 shadow-2xl">
            {matches.map((id, i) => (
              <button
                key={id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickMention(id);
                }}
                onMouseEnter={() => setMentionCursor(i)}
                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors ${
                  i === mentionCursor ? "bg-hover" : ""
                }`}
              >
                <Avatar agentId={id} size="sm" badge={false} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-ink">{AGENTS[id].name}</span>
                  <span className="block truncate text-[11px] text-ink-3">{AGENTS[id].title}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-line-strong bg-canvas transition-colors focus-within:border-ink-4">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => {
              const v = e.target.value;
              const caret = e.target.selectionStart;
              if (v[caret - 1] === "@") {
                setMentionAt(caret - 1);
                setMentionCursor(0);
              } else if (mentionAt !== null && caret <= mentionAt) {
                setMentionAt(null);
              }
              setText(v);
              resize(e.target);
            }}
            onKeyDown={onKeyDown}
            placeholder={`Message ${channelName}`}
            rows={1}
            className="block max-h-52 w-full resize-none bg-transparent px-3 pb-1 pt-2.5 text-[14px] leading-[1.6] text-ink placeholder:text-ink-4 focus:outline-none"
          />

          <div className="flex items-center gap-0.5 px-2 pb-2">
            <FormatButton label="Bold" onClick={() => applyFormat("**", "bold")}>
              <span className="text-[12px] font-bold">B</span>
            </FormatButton>
            <FormatButton label="Italic" onClick={() => applyFormat("_", "italic")}>
              <span className="text-[12px] italic">I</span>
            </FormatButton>
            <FormatButton label="Code" onClick={() => applyFormat("`", "code")}>
              <span className="font-mono text-[11px]">{"</>"}</span>
            </FormatButton>
            <span className="mx-1 h-4 w-px bg-line" />
            <FormatButton
              label="Mention someone"
              onClick={() => {
                const el = ref.current;
                if (!el) return;
                const caret = el.selectionStart;
                const next = text.slice(0, caret) + "@" + text.slice(caret);
                setMentionAt(caret);
                setMentionCursor(0);
                update(next, caret + 1);
              }}
            >
              <span className="text-[12px]">@</span>
            </FormatButton>

            <span className="ml-auto flex items-center gap-2">
              <span className="hidden text-[10px] text-ink-4 sm:inline">
                <kbd className="rounded border border-line px-1">↵</kbd> to send
              </span>
              <button
                onClick={submit}
                disabled={!text.trim() || sending}
                className="rounded-md bg-control px-3 py-1.5 text-xs font-medium text-control-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </span>
          </div>
        </div>
      </div>

      {error && <p className="mt-1.5 text-[11px] text-revise">{error}</p>}
    </div>
  );
}

function FormatButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded text-ink-3 transition-colors hover:bg-hover hover:text-ink sm:h-7 sm:w-7"
    >
      {children}
    </button>
  );
}
