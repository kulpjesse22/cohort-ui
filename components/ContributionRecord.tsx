import { getContributionSnapshot, getContributorIdentity, type ContributorId } from "@/lib/contributions";

const TONE: Record<ContributorId, string> = {
  human: "border-ink-3 bg-raised text-ink",
  claude: "agent-violet border-current/20 bg-canvas text-current",
  codex: "agent-teal border-current/20 bg-canvas text-current",
};

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatLines(added: number, removed: number): string {
  return `+${added.toLocaleString()} / -${removed.toLocaleString()}`;
}

function ContributorBadge({ id }: { id: ContributorId }) {
  const identity = getContributorIdentity(id);

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${TONE[id]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {identity.name}
    </span>
  );
}

export function ContributionRecord() {
  const snapshot = getContributionSnapshot();
  const recent = snapshot.commits.slice(0, 4);

  return (
    <section className="mb-6 border-y border-line bg-panel/45 py-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
            Contribution record
          </h2>
          <p className="mt-1 max-w-xl text-[13px] leading-6 text-ink-2">
            Built from Git history and co-author trailers. The UI is reading a
            committed snapshot, so the attribution is part of the repo record.
          </p>
        </div>
        <div className="rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[11px] text-ink-3">
          HEAD {snapshot.head}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {snapshot.contributors.map((contributor) => {
          const identity = getContributorIdentity(contributor.id);
          return (
            <div key={contributor.id} className="rounded-md border border-line bg-canvas p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <ContributorBadge id={contributor.id} />
                <span className="text-[10px] uppercase tracking-[0.06em] text-ink-4">
                  {identity.kind}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-ink-3">
                <Stat value={contributor.commits} label="Commits" />
                <Stat value={contributor.files} label="Files" />
                <Stat value={contributor.shared} label="Shared" />
              </div>
              <div className="mt-2 font-mono text-[10px] text-ink-4">
                {formatLines(contributor.added, contributor.removed)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {recent.map((commit) => (
          <div
            key={commit.sha}
            className="grid gap-2 rounded-md border border-line bg-canvas px-3 py-2 text-[12px] sm:grid-cols-[4.25rem_minmax(0,1fr)_auto]"
          >
            <span className="font-mono text-[11px] text-ink-4">{commit.sha}</span>
            <span className="min-w-0 truncate font-medium text-ink">{commit.subject}</span>
            <span className="flex flex-wrap items-center gap-1.5 sm:justify-end">
              <span className="text-[10px] text-ink-4">{formatDay(commit.date)}</span>
              {commit.contributors.map((id) => (
                <ContributorBadge key={id} id={id} />
              ))}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-[16px] font-semibold text-ink">{value.toLocaleString()}</div>
      <div>{label}</div>
    </div>
  );
}
