import type { ImpactDimension, ReportEvent } from "@/lib/types";
import { SOURCES } from "@/lib/types";
import { TopicBadge } from "./TopicBadge";

const DIM_COLOR: Record<ImpactDimension, string> = {
  "Information Security": "#b3122d",
  Technology: "#3b82f6",
  Innovation: "#d4a64a",
  "Lifestyle & Hacks": "#2e7d5b",
};

function ImpactBadge({ dim }: { dim: ImpactDimension }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]"
      style={{
        color: DIM_COLOR[dim],
        background: `${DIM_COLOR[dim]}1a`,
        border: `1px solid ${DIM_COLOR[dim]}40`,
      }}
    >
      {dim}
    </span>
  );
}

function SourceBadge({ source }: { source: ReportEvent["source"] }) {
  const meta = SOURCES[source];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em]"
      style={{ color: meta.accent }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: meta.accent }}
      />
      {meta.label}
    </span>
  );
}

/**
 * Event detail card with a printed-report 5W1H table and follow-up questions.
 * Dark glassmorphism aesthetic.
 */
export function EventCard({ event }: { event: ReportEvent }) {
  return (
    <article className="paper-card paper-card-hover animate-fade-up p-5">
      <div className="flex items-start justify-between gap-3">
        <SourceBadge source={event.source} />
        {event.score ? (
          <span className="tnum text-[11px] text-muted">▲ {event.score}</span>
        ) : null}
      </div>

      <h3 className="mt-2 font-serif-display text-lg font-semibold leading-snug text-ink text-balance">
        {event.title}
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {event.impacts.map((d) => (
          <ImpactBadge key={d} dim={d} />
        ))}
        {event.topics.map((t) => (
          <TopicBadge key={t} topic={t} />
        ))}
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
        {event.summary}
      </p>
      {event.excerpt ? (
        <p className="mt-3 border-l-2 border-rule pl-3 text-[12px] leading-relaxed text-muted">
          Publisher excerpt: {event.excerpt}
        </p>
      ) : null}

      {/* 5W1H exhibit table */}
      <table className="report-table mt-4 w-full text-[12.5px]">
        <tbody>
          <Row k="Who" v={event.who} />
          <Row k="What" v={event.what} />
          <Row k="When" v={event.when} />
          <Row k="Where" v={event.where} />
          <Row k="Why" v={event.why} />
          <Row k="How" v={event.how} last />
        </tbody>
      </table>

      {/* Forward-looking questions */}
      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-rule pt-4 sm:grid-cols-2">
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            Ideas worth exploring
          </h4>
          <ul className="mt-2 space-y-1.5">
            {event.ideasWorthExploring.map((q, i) => (
              <li key={i} className="text-[12.5px] leading-snug text-ink-soft">
                <span className="mr-1 text-gold">→</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo">
            What to watch
          </h4>
          <ul className="mt-2 space-y-1.5">
            {event.whatToWatch.map((q, i) => (
              <li key={i} className="text-[12.5px] leading-snug text-ink-soft">
                <span className="mr-1 text-indigo">▪</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-rule pt-3 text-[11px]">
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-indigo underline decoration-gold decoration-2 underline-offset-2 hover:text-gold"
        >
          Open source ↗
        </a>
        <span className="tnum text-muted">Ref: {event.id}</span>
      </div>
    </article>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <tr className={last ? "" : ""}>
      <th
        scope="row"
        className="w-16 py-1.5 pr-3 text-left align-top text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
      >
        {k}
      </th>
      <td className="py-1.5 align-top text-ink-soft">{v}</td>
    </tr>
  );
}
