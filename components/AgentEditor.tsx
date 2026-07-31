"use client";

import { useRef, useState } from "react";
import { AGENTS, type AgentId } from "@/lib/agents";
import {
  COLOR_OPTIONS,
  MARK_OPTIONS,
  VOICES,
  type AgentCustomization,
  type ColorId,
  type MarkId,
} from "@/lib/roster";
import { AgentMark } from "./AgentMark";

const CHIP: Record<string, string> = {
  violet: "agent-violet agent-chip",
  sky: "agent-sky agent-chip",
  teal: "agent-teal agent-chip",
  amber: "agent-amber agent-chip",
  rose: "agent-rose agent-chip",
};

export function AgentEditor({
  agentId,
  value,
  onChange,
  onClose,
}: {
  agentId: AgentId;
  value: AgentCustomization;
  onChange: (next: AgentCustomization) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function set<K extends keyof AgentCustomization>(k: K, v: AgentCustomization[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  async function previewVoice(voiceId: string) {
    setError(null);
    audioRef.current?.pause();
    setPlaying(voiceId);
    try {
      const res = await fetch("/api/voice-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId,
          text: draft.workingStyle || `I'm ${draft.displayName}. ${draft.title}.`,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? `Preview failed (${res.status})`);
      }
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setPlaying(null);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
      setPlaying(null);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/roster/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error ?? "Save failed");
      onChange(j.customization);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    try {
      const res = await fetch(`/api/roster/${agentId}`, { method: "DELETE" });
      const j = await res.json();
      setDraft(j.customization);
      onChange(j.customization);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-raised p-4 lg:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] ${CHIP[draft.color]}`}
        >
          <AgentMark agentId={draft.mark} size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Customize {AGENTS[agentId].name}
          </h2>
          <p className="mt-0.5 text-[11px] text-ink-3">
            Identity is yours to change. Scope and boundaries come from the role
            doc and stay fixed.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Display name">
            <input
              value={draft.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              maxLength={40}
              className="w-full rounded-md border border-line-strong bg-canvas px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-ink-3"
            />
          </Field>
          <Field label="Title">
            <input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={60}
              className="w-full rounded-md border border-line-strong bg-canvas px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-ink-3"
            />
          </Field>
        </div>

        <Field label="Working style" hint="Informs how they work, not what they're allowed to touch.">
          <textarea
            value={draft.workingStyle}
            onChange={(e) => set("workingStyle", e.target.value)}
            maxLength={200}
            rows={2}
            className="w-full resize-none rounded-md border border-line-strong bg-canvas px-2.5 py-1.5 text-[13px] leading-relaxed text-ink outline-none focus:border-ink-3"
          />
        </Field>

        <Field label="Mark">
          <div className="flex flex-wrap gap-1.5">
            {MARK_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => set("mark", m as MarkId)}
                aria-pressed={draft.mark === m}
                className={`flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors ${
                  draft.mark === m
                    ? `border-transparent ${CHIP[draft.color]}`
                    : "border-line-strong text-ink-3 hover:text-ink"
                }`}
              >
                <AgentMark agentId={m} size={17} />
              </button>
            ))}
          </div>
        </Field>

        <Field label="Colour">
          <div className="flex flex-wrap gap-1.5">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => set("color", c as ColorId)}
                aria-pressed={draft.color === c}
                title={c}
                className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${CHIP[c]} ${
                  draft.color === c ? "ring-2 ring-ink ring-offset-2 ring-offset-raised" : ""
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-current" />
              </button>
            ))}
          </div>
        </Field>

        <Field label="Voice" hint="Press play to hear the line above in that voice.">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {VOICES.map((v) => {
              const selected = draft.voiceId === v.id;
              return (
                <div
                  key={v.id}
                  className={`flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors ${
                    selected ? "border-ink-3 bg-canvas" : "border-line-strong"
                  }`}
                >
                  <button
                    onClick={() => set("voiceId", v.id)}
                    aria-pressed={selected}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-[13px] text-ink">{v.name}</span>
                    <span className="block truncate text-[10px] text-ink-3">
                      {v.accent} · {v.descriptive}
                    </span>
                  </button>
                  <button
                    onClick={() => previewVoice(v.id)}
                    title={`Preview ${v.name}`}
                    aria-label={`Preview ${v.name}`}
                    className="shrink-0 rounded p-1 text-ink-3 transition-colors hover:bg-hover hover:text-ink"
                  >
                    {playing === v.id ? <WaveIcon /> : <PlayIcon />}
                  </button>
                </div>
              );
            })}
          </div>
        </Field>
      </div>

      {error && <p className="mt-3 text-[11px] text-revise">{error}</p>}

      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-control px-3 py-1.5 text-xs font-medium text-control-ink transition-opacity disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onClose}
          className="rounded-md border border-line-strong px-3 py-1.5 text-xs text-ink-2 hover:bg-hover"
        >
          Cancel
        </button>
        <button
          onClick={reset}
          className="ml-auto text-[11px] text-ink-3 hover:text-ink"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
        {label}
      </div>
      {children}
      {hint && <p className="mt-1 text-[10px] text-ink-4">{hint}</p>}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4.5 3.2v7.6L11 7 4.5 3.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 7h1.6M5.2 4v6M8 2.4v9.2M10.8 5v4M13 7h-1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
