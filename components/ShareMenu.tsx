"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BranchIcon, CheckIcon, ChevronDownIcon, ExternalIcon, LinkIcon, PromptIcon, ShareIcon } from "./Icons";

/**
 * Share and hand-off actions for one handoff. Copying is confirmed in place,
 * on the item that did it: Cohort has no toasts.
 *
 * "Open in" names what Cohort already names. GitHub opens the file on main.
 * Claude and Codex are the agents in the contribution record; there is no
 * session to deep-link into, so they copy the prompt and say so.
 */

type Item =
  | { kind: "copy"; id: string; label: string; icon: ReactNode; text: string | null; hint?: string }
  | { kind: "link"; id: string; label: string; icon: ReactNode; href: string | null; hint?: string };

function AgentDot() {
  return (
    <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center">
      <span className="h-2 w-2 rounded-full ring-1 ring-inset ring-current" />
    </span>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ShareMenu({
  link,
  branch,
  prompt,
  fileUrl,
}: {
  /** Path to this handoff, made absolute when copied. */
  link: string;
  branch: string | null;
  prompt: string;
  fileUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<{ id: string; ok: boolean } | null>(null);
  const [quick, setQuick] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  const items: Item[] = [
    { kind: "copy", id: "link", label: "Copy link", icon: <LinkIcon />, text: "link" },
    {
      kind: "copy",
      id: "branch",
      label: "Copy branch name",
      icon: <BranchIcon />,
      text: branch,
      hint: branch ? undefined : "None recorded",
    },
    { kind: "copy", id: "prompt", label: "Copy as prompt", icon: <PromptIcon /> , text: prompt },
  ];
  const openIn: Item[] = [
    { kind: "link", id: "github", label: "GitHub", icon: <ExternalIcon />, href: fileUrl, hint: fileUrl ? "File on main" : "No file" },
    { kind: "copy", id: "claude", label: "Claude", icon: <AgentDot />, text: prompt, hint: "Copies prompt" },
    { kind: "copy", id: "codex", label: "Codex", icon: <AgentDot />, text: prompt, hint: "Copies prompt" },
  ];

  function enabled(): HTMLElement[] {
    return [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])];
  }

  function close(refocus = true) {
    setOpen(false);
    setDone(null);
    if (refocus) button.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    enabled()[0]?.focus();
    function onDown(e: PointerEvent) {
      if (!wrap.current?.contains(e.target as Node)) {
        setOpen(false);
        setDone(null);
      }
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function absolute() {
    return new URL(link, window.location.origin).toString();
  }

  async function run(item: Item) {
    if (item.kind === "link") {
      close();
      return;
    }
    if (!item.text) return;
    const ok = await copyText(item.text === "link" ? absolute() : item.text);
    setDone({ id: item.id, ok });
    if (timer.current) window.clearTimeout(timer.current);
    if (ok) timer.current = window.setTimeout(() => close(), 900);
  }

  async function quickCopy() {
    const ok = await copyText(absolute());
    if (!ok) return;
    setQuick(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setQuick(false), 1400);
  }

  function onMenuKey(e: React.KeyboardEvent) {
    const list = enabled();
    const at = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      list[(at + 1) % list.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      list[(at - 1 + list.length) % list.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      list[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      list[list.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  }

  function row(item: Item) {
    const disabled = item.kind === "copy" ? !item.text : !item.href;
    const state = done?.id === item.id ? done : null;
    const body = (
      <>
        <span className={state?.ok ? "text-approved" : "text-ink-3"}>{state?.ok ? <CheckIcon /> : item.icon}</span>
        <span className="min-w-0 flex-1 truncate">{state?.ok ? "Copied" : item.label}</span>
        {state && !state.ok ? (
          <span className="text-meta text-revise">Couldn&rsquo;t copy</span>
        ) : (
          item.hint && <span className="shrink-0 text-meta text-ink-3">{item.hint}</span>
        )}
      </>
    );
    const cls = `aff flex min-h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-body text-ink ${
      disabled ? "cursor-not-allowed opacity-40" : ""
    }`;

    if (item.kind === "link" && item.href) {
      return (
        <a
          key={item.id}
          role="menuitem"
          tabIndex={-1}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          onClick={() => run(item)}
          className={cls}
        >
          {body}
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      );
    }
    return (
      <button
        key={item.id}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && run(item)}
        className={cls}
      >
        {body}
      </button>
    );
  }

  return (
    <div ref={wrap} className="relative flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={quickCopy}
        aria-label={quick ? "Link copied" : "Copy link"}
        data-tip={quick ? "Copied" : "Copy link"}
        className={`aff tip flex h-8 w-8 items-center justify-center rounded-md ${
          quick ? "text-approved" : "text-ink-3 hover:text-ink"
        }`}
      >
        {quick ? <CheckIcon /> : <LinkIcon />}
      </button>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share and open in"
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`aff flex h-8 items-center gap-1 rounded-md px-1.5 ${
          open ? "bg-[var(--aff-sel)] text-ink" : "text-ink-3 hover:text-ink"
        }`}
      >
        <ShareIcon />
        <ChevronDownIcon className="h-3 w-3" />
      </button>

      {open && (
        <div
          ref={menu}
          role="menu"
          aria-label="Share and open in"
          onKeyDown={onMenuKey}
          className="absolute right-0 top-[calc(100%+4px)] z-50 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-line-strong bg-canvas p-1"
        >
          {items.map(row)}
          <div role="separator" className="my-1 h-px bg-line" />
          <div className="px-2 pb-0.5 pt-1 text-label font-semibold uppercase tracking-[0.06em] text-ink-3" aria-hidden="true">
            Open in
          </div>
          <div role="group" aria-label="Open in">
            {openIn.map(row)}
          </div>
        </div>
      )}
    </div>
  );
}
