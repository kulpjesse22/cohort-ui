import { getContributionSnapshot, getContributorIdentity, type ContributorId } from "@/lib/contributions";
import { ProvenanceTag } from "./Marks";

// Claude and Codex are not the roster's agents, so they do not borrow a
// roster hue: a human gets a filled dot, an agent an open one.
const DOT: Record<ContributorId, string> = {
  human: "bg-current",
  claude: "ring-1 ring-inset ring-current",
  codex: "ring-1 ring-inset ring-current",
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
    <span className="inline-flex items-center gap-1.5 text-meta font-semibold text-ink-2">
      <span className={`h-2 w-2 rounded-full ${DOT[id]}`} aria-hidden="true" />
      {identity.name}
    </span>
  );
}

export function ContributionRecord() {
  const snapshot = getContributionSnapshot();
  const recent = snapshot.commits.slice(0, 4);

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line pb-2">
        <h2 className="text-label font-semibold uppercase tracking-[0.06em] text-ink-3">Contribution record</h2>
        <ProvenanceTag kind="snapshot" title="Built from Git history and co-author trailers, committed to the repo">
          Committed snapshot at <span className="font-mono text-ink-2">{snapshot.head}</span>
        </ProvenanceTag>
      </div>

      <table className="mt-1 w-full text-left">
        <caption className="sr-only">Commits, files and shared commits per contributor</caption>
        <thead>
          <tr className="text-meta text-ink-3">
            <th scope="col" className="py-2 font-normal">Contributor</th>
            <th scope="col" className="py-2 text-right font-normal">Commits</th>
            <th scope="col" className="hidden py-2 text-right font-normal sm:table-cell">Files</th>
            <th scope="col" className="py-2 text-right font-normal">Shared</th>
            <th scope="col" className="hidden py-2 pl-4 text-right font-normal sm:table-cell">Lines</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line border-t border-line">
          {snapshot.contributors.map((contributor) => {
            const identity = getContributorIdentity(contributor.id);
            return (
              <tr key={contributor.id} className="text-body tabular-nums">
                <td className="py-2.5">
                  <span className="flex items-center gap-2">
                    <ContributorBadge id={contributor.id} />
                    <span className="text-meta text-ink-3">{identity.kind}</span>
                  </span>
                </td>
                <td className="py-2.5 text-right font-semibold text-ink">{contributor.commits.toLocaleString()}</td>
                <td className="hidden py-2.5 text-right text-ink-2 sm:table-cell">{contributor.files.toLocaleString()}</td>
                <td className="py-2.5 text-right text-ink-2">{contributor.shared.toLocaleString()}</td>
                <td className="hidden py-2.5 pl-4 text-right font-mono text-meta text-ink-3 sm:table-cell">
                  {formatLines(contributor.added, contributor.removed)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 className="mt-6 text-meta text-ink-3">Latest commits</h3>
      <ul className="mt-1 divide-y divide-line">
        {recent.map((commit) => (
          <li
            key={commit.sha}
            className="grid gap-x-3 gap-y-1 py-2.5 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto] sm:items-center"
          >
            <span className="font-mono text-meta text-ink-3">{commit.sha}</span>
            <span className="min-w-0 text-body text-ink sm:truncate">{commit.subject}</span>
            <span className="flex flex-wrap items-center gap-1.5 sm:justify-end">
              <span className="text-meta tabular-nums text-ink-3">{formatDay(commit.date)}</span>
              {commit.contributors.map((id) => (
                <ContributorBadge key={id} id={id} />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
