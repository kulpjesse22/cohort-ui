import Link from "next/link";
import { AGENTS, type AgentId } from "@/lib/agents";
import { CrewFigure } from "./CrewFigure";

/**
 * The profile's real header.
 *
 * The toolbar above stays a single compact row, because it is shared chrome:
 * search, presence and the activity board sit in it on every route, and a band
 * that triples in height on one page makes the app feel like it jumps. So the
 * subject of the page gets its own masthead at the top of the scroll instead,
 * which is also the only place a standing figure fits.
 *
 * Full body rather than the bust crop. The crop is built for rows, where hair
 * silhouette is all that survives; here there is room for the stand, the
 * sleeves and the pips on them — which is the whole of what the figure knows
 * about this teammate, and none of it reads at 44px.
 *
 * The ladder exists because the figure is already drawing rank and nothing on
 * the page said so. Three pips on a sleeve are not self-explanatory.
 */

const RUNG_COUNT = 4;

export function AgentMasthead({
  agentId,
  name,
  title,
}: {
  agentId: AgentId;
  /** Customized display name, falling back to the roster's. */
  name: string;
  title: string;
}) {
  const agent = AGENTS[agentId];

  return (
    <div className="mb-10 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-x-4 sm:gap-x-6">
      <div className="sm:row-span-2 sm:self-end">
        <CrewFigure
          agentId={agentId}
          size={128}
          crop={false}
          state="idle"
        />
      </div>

      <div className="min-w-0 pb-1">
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-lead font-semibold text-ink">{name}</h1>
            <p className="mt-1 text-body text-ink-3">{title}</p>
          </div>
          {/* Lives here rather than in the toolbar. That row never gets wider
              than about 260px once the activity board and search have taken
              their share, and two buttons that will not shrink left the name
              four pixels — so the action that has a home down here took it. */}
          <Link
            href={`/c/${agentId}`}
            className="flex min-h-8 shrink-0 items-center rounded-md bg-control px-3 text-meta font-semibold text-control-ink transition-opacity hover:opacity-90"
          >
            Message #{agentId}
          </Link>
        </div>
      </div>

      <div className="col-span-2 min-w-0 pt-4 sm:col-span-1 sm:col-start-2 sm:pt-0">
        <p className="max-w-lg text-body text-ink-2">{agent.blurb}</p>

        <div className="mt-5 max-w-lg">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-label font-semibold uppercase text-ink-3">Rank</span>
            {/* The roster's own word, not a name for the rung. Two vocabularies
                for one fact is how "Lead" in the chip above ends up reading as
                a different rank from "Principal" down here. */}
            <span className="text-meta font-semibold text-ink-2">{agent.seniority}</span>
          </div>

          <ol
            className="mt-1.5 flex gap-1"
            aria-label={`${agent.seniority}: rung ${agent.rank} of ${RUNG_COUNT}`}
          >
            {Array.from({ length: RUNG_COUNT }, (_, i) => (
              <li
                key={i}
                aria-hidden="true"
                className={`h-[3px] flex-1 rounded-full ${
                  i < agent.rank ? "bg-ink-2" : "bg-line-strong"
                }`}
              />
            ))}
          </ol>

          {/* The same thing the trust chip says when opened, said here without
              a click. A ladder drawn beside evidence counts invites the reading
              that the rung was earned from them and buys something; it was not
              and it does not. Cheaper to say than to be asked. */}
          <p className="mt-2 text-meta text-ink-3">
            A label, not a permission. Nothing on this ladder is enforced — work
            at every rung is still approved by you or a peer reviewer. More
            autonomy only after clean reviews and captured lessons.
          </p>
        </div>
      </div>
    </div>
  );
}
