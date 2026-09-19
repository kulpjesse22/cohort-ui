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
    <div className="mb-6 flex items-start gap-4 rounded-xl border border-line bg-raised p-4 sm:gap-5 sm:p-5">
      <CrewFigure
        agentId={agentId}
        size={112}
        crop={false}
        state="idle"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-semibold tracking-[-0.02em] text-ink">
              {name}
            </h1>
            <p className="mt-0.5 text-[12px] text-ink-3">{title}</p>
          </div>
          {/* Lives here rather than in the toolbar. That row never gets wider
              than about 260px once the activity board and search have taken
              their share, and two buttons that will not shrink left the name
              four pixels — so the action that has a home down here took it. */}
          <Link
            href={`/c/${agentId}`}
            className="shrink-0 rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-ink-2 transition-colors hover:bg-hover hover:text-ink"
          >
            Message #{agentId}
          </Link>
        </div>

        <p className="mt-2.5 text-[12px] leading-5 text-ink-2">{agent.blurb}</p>

        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
              Rank
            </span>
            {/* The roster's own word, not a name for the rung. Two vocabularies
                for one fact is how "Lead" in the chip above ends up reading as
                a different rank from "Principal" down here. */}
            <span className="text-[11px] font-semibold text-ink-2">
              {agent.seniority}
            </span>
          </div>

          <ol
            className="mt-1.5 flex gap-1"
            aria-label={`${agent.seniority}: rung ${agent.rank} of ${RUNG_COUNT}`}
          >
            {Array.from({ length: RUNG_COUNT }, (_, i) => (
              <li
                key={i}
                aria-hidden="true"
                className={`h-1 flex-1 rounded-full ${
                  i < agent.rank ? "bg-ink-3" : "bg-line-strong"
                }`}
              />
            ))}
          </ol>

          {/* The same thing the trust chip says when opened, said here without
              a click. A ladder drawn beside evidence counts invites the reading
              that the rung was earned from them and buys something; it was not
              and it does not. Cheaper to say than to be asked. */}
          <p className="mt-2 text-[11px] leading-4 text-ink-3">
            A label, not a permission. Nothing on this ladder is enforced — work
            at every rung is still approved by you or a peer reviewer. More
            autonomy only after clean reviews and captured lessons.
          </p>
        </div>
      </div>
    </div>
  );
}
