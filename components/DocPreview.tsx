"use client";

import type { ReactNode } from "react";

/**
 * A read-only preview of a repository document, shaped so you can tell what
 * kind of thing it is at a glance.
 *
 * The raw markdown dump was accurate and unreadable — a wall of monospace that
 * looked identical whether it was a design guide or a plan. Someone glancing at
 * a screen share needs to recognise the artifact before they read a word of it,
 * so each type carries a hue and a label, and a design guide shows its actual
 * palette. The colours are pulled from the file, not decoration: they are what
 * that document literally defines.
 */

type DocKind = { label: string; hue: string; accent: string };

function classify(path: string): DocKind {
  if (/design/i.test(path)) return { label: "Design guide", hue: "agent-rose", accent: "text-[var(--hue)]" };
  if (/ux/i.test(path)) return { label: "UX guide", hue: "agent-teal", accent: "text-[var(--hue)]" };
  if (/planning/i.test(path)) return { label: "Plan", hue: "agent-sky", accent: "text-[var(--hue)]" };
  if (/lesson/i.test(path)) return { label: "Lessons", hue: "agent-amber", accent: "text-[var(--hue)]" };
  return { label: "Document", hue: "agent-violet", accent: "text-[var(--hue)]" };
}

/** Hex tokens the document itself defines — a design file's real subject. */
function swatches(content: string): string[] {
  const found = content.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  return [...new Set(found)].slice(0, 8);
}

function inline(text: string): ReactNode {
  // Bold and code only. Enough to stop the preview reading as a text dump
  // without pretending to be a markdown renderer.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={i} className="rounded bg-raised px-1 py-px font-mono text-[10px] text-ink-2">
          {p.slice(1, -1)}
        </code>
      );
    return <span key={i}>{p}</span>;
  });
}

export function DocPreview({
  path,
  content,
  isCanon = false,
  action,
}: {
  path: string;
  content: string | null;
  isCanon?: boolean;
  action?: ReactNode;
}) {
  const kind = classify(path);
  const name = path.split("/").pop() ?? path;
  const colors = content ? swatches(content) : [];

  const lines = (content ?? "")
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .slice(0, 14);

  return (
    <div className={`${kind.hue} overflow-hidden rounded-lg border border-line bg-canvas`}>
      {/* A coloured spine so the type is legible before anything is read. */}
      <div className="h-1 w-full" style={{ background: "var(--hue)" }} />

      <div className="flex items-center justify-between gap-2 px-3 pb-1.5 pt-2">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              color: "var(--hue)",
              background: "color-mix(in srgb, var(--hue) 14%, transparent)",
            }}
          >
            {kind.label}
          </span>
          <span className="truncate text-[12px] font-semibold text-ink">{name}</span>
          {isCanon && (
            <span className="shrink-0 text-[10px] font-medium text-approved">source of truth</span>
          )}
        </span>
      </div>

      {colors.length >= 3 && (
        <div className="flex items-center gap-1 px-3 pb-2">
          {colors.map((c) => (
            <span
              key={c}
              title={c}
              className="h-4 w-4 rounded-[3px] ring-1 ring-inset ring-black/10"
              style={{ background: c }}
            />
          ))}
          <span className="ml-1 text-[10px] text-ink-4">tokens</span>
        </div>
      )}

      <div className="max-h-52 space-y-1 overflow-hidden px-3 pb-2 text-[11px] leading-relaxed">
        {content === null ? (
          <p className="text-ink-4">Not in the repository yet.</p>
        ) : (
          lines.map((line, i) => {
            const t = line.trim();
            if (/^#\s/.test(t))
              return (
                <p key={i} className="text-[12px] font-semibold text-ink">
                  {t.replace(/^#\s/, "")}
                </p>
              );
            if (/^##\s/.test(t))
              return (
                <p
                  key={i}
                  className="pt-1 text-[10px] font-medium uppercase tracking-[0.06em]"
                  style={{ color: "var(--hue)" }}
                >
                  {t.replace(/^#+\s/, "")}
                </p>
              );
            if (/^-\s/.test(t))
              return (
                <p key={i} className="flex gap-1.5 text-ink-2">
                  <span className="shrink-0 text-ink-4">·</span>
                  <span className="min-w-0">{inline(t.replace(/^-\s/, ""))}</span>
                </p>
              );
            return (
              <p key={i} className="text-ink-2">
                {inline(t)}
              </p>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5">
        <span className="truncate font-mono text-[10px] text-ink-4">{path}</span>
        <span className="flex shrink-0 items-center gap-2.5">{action}</span>
      </div>
    </div>
  );
}
