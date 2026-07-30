"use client";

import { useRef, useState } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(trimmed);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-line px-4 py-3 lg:px-5">
      <div className="flex items-end gap-2 rounded-lg border border-line-strong bg-canvas px-3 py-2 focus-within:border-ink-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            resize(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={`Message ${channelName}`}
          rows={1}
          className="max-h-40 flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="shrink-0 rounded-md bg-control px-3 py-1.5 text-xs font-medium text-control-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11px] text-rose-400">{error}</p>}
    </form>
  );
}
