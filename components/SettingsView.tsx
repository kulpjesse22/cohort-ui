"use client";

import { useId, type ReactNode } from "react";
import Link from "next/link";
import {
  ARCHIVE_OPTIONS,
  DEFAULT_SETTINGS,
  REVIEWER_OPTIONS,
  STALE_OPTIONS,
  STALE_STATUS_OPTIONS,
  type ReviewSettings,
} from "@/lib/settings";
import { useReviewSettings } from "@/lib/useReviewSettings";
import { AppShell } from "./AppShell";
import { Select, Switch } from "./Controls";

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="rounded-lg bg-raised px-4 sm:px-5">
      <ul className="divide-y divide-line">{children}</ul>
    </section>
  );
}

function SettingRow({
  label,
  hint,
  control,
  disabled = false,
}: {
  label: ReactNode;
  hint?: string;
  control: ReactNode;
  disabled?: boolean;
}) {
  return (
    <li className={`flex min-h-14 items-center gap-4 py-3 ${disabled ? "opacity-40" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="text-body text-ink">{label}</div>
        {hint && <p className="text-meta text-ink-3">{hint}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </li>
  );
}

export function SettingsView() {
  const { settings, update, reset } = useReviewSettings();
  const uid = useId();
  const id = (k: keyof ReviewSettings) => `${uid}-${k}`;
  const label = (k: keyof ReviewSettings) => `${uid}-${k}-label`;
  const isDefault = (Object.keys(DEFAULT_SETTINGS) as (keyof ReviewSettings)[]).every(
    (k) => settings[k] === DEFAULT_SETTINGS[k]
  );

  const header = (
    <div className="min-w-0">
      <h1 className="truncate text-heading font-semibold text-ink">Settings</h1>
      <p className="truncate text-meta text-ink-3">How handoffs age once they reach you.</p>
    </div>
  );

  return (
    <AppShell activeChannelId={null} header={header} rail={false}>
      <div className="flex-1 overflow-y-auto px-4 pb-16 pt-8 lg:px-6 lg:pt-12">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-title font-semibold text-ink">
            How handoffs age.{" "}
            <span className="text-ink-3">Kept in this browser. Nothing here writes to the repo.</span>
          </h2>

          <h3 className="mb-2 mt-10 px-1 text-label font-semibold uppercase tracking-[0.06em] text-ink-3">
            Stale handoffs
          </h3>
          <Card label="Stale handoffs">
            <SettingRow
              label={<span id={label("autoClose")}>Auto-close stale handoffs</span>}
              hint="An open handoff nobody has acted on leaves the queue."
              control={
                <Switch
                  id={id("autoClose")}
                  labelledBy={label("autoClose")}
                  checked={settings.autoClose}
                  onChange={(v) => update({ autoClose: v })}
                />
              }
            />
            <SettingRow
              disabled={!settings.autoClose}
              label={<span id={label("staleAfter")}>Close after being stale for</span>}
              control={
                <Select
                  id={id("staleAfter")}
                  labelledBy={label("staleAfter")}
                  value={settings.staleAfter}
                  options={STALE_OPTIONS}
                  disabled={!settings.autoClose}
                  onChange={(v) => update({ staleAfter: v })}
                />
              }
            />
            <SettingRow
              disabled={!settings.autoClose}
              label={<span id={label("staleStatus")}>Set status to</span>}
              hint="Never a verdict. Only a reviewer issues one."
              control={
                <Select
                  id={id("staleStatus")}
                  labelledBy={label("staleStatus")}
                  value={settings.staleStatus}
                  options={STALE_STATUS_OPTIONS}
                  disabled={!settings.autoClose}
                  onChange={(v) => update({ staleStatus: v })}
                />
              }
            />
          </Card>

          <h3 className="mb-2 mt-8 px-1 text-label font-semibold uppercase tracking-[0.06em] text-ink-3">
            Completed
          </h3>
          <Card label="Completed">
            <SettingRow
              label={<span id={label("archiveAfter")}>Auto-archive handoffs completed for</span>}
              hint="Archived handoffs leave the list. Their links still open."
              control={
                <Select
                  id={id("archiveAfter")}
                  labelledBy={label("archiveAfter")}
                  value={settings.archiveAfter}
                  options={ARCHIVE_OPTIONS}
                  onChange={(v) => update({ archiveAfter: v })}
                />
              }
            />
          </Card>

          <h3 className="mb-2 mt-8 px-1 text-label font-semibold uppercase tracking-[0.06em] text-ink-3">
            Routing
          </h3>
          <Card label="Routing">
            <SettingRow
              label={<span id={label("defaultReviewer")}>Default reviewer</span>}
              hint="Takes a handoff that names no reviewer."
              control={
                <Select
                  id={id("defaultReviewer")}
                  labelledBy={label("defaultReviewer")}
                  value={settings.defaultReviewer}
                  options={REVIEWER_OPTIONS}
                  onChange={(v) => update({ defaultReviewer: v })}
                />
              }
            />
          </Card>

          <h3
            id="workspace"
            className="mb-2 mt-8 scroll-mt-8 px-1 text-label font-semibold uppercase tracking-[0.06em] text-ink-3"
          >
            Workspace
          </h3>
          <Card label="Workspace">
            <SettingRow
              disabled
              label="Invite people"
              hint="Not built. Cohort has one person, you, and no model of who may approve what."
              control={<span className="text-meta text-ink-3">Not yet</span>}
            />
            <SettingRow
              disabled
              label="Connect GitHub"
              hint="Not built. Handoffs are read from Agents/handoffs/ in this repository, not from pull requests."
              control={<span className="text-meta text-ink-3">Not yet</span>}
            />
          </Card>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
            <Link
              href="/reviews"
              className="text-meta text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink-3"
            >
              See the effect in Reviews
            </Link>
            <button
              type="button"
              onClick={reset}
              disabled={isDefault}
              className="aff-fill flex min-h-8 items-center rounded-md px-2.5 text-meta text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
