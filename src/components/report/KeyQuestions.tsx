import type { DailyReport } from "@/lib/types";
import { SOURCES } from "@/lib/types";

export function KeyQuestions({ report }: { report: DailyReport }) {
  return (
    <section className="border-t border-rule bg-surface-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_1fr]">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
            Questions to carry forward
          </h3>
          <ol className="mt-4 space-y-3">
            {report.keyQuestions.map((q, i) => (
              <li
                key={i}
                className="flex gap-3 font-serif-display text-lg leading-snug text-ink text-balance"
              >
                <span className="tnum text-sm text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
            Methodology &amp; source status
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Signals are ingested live from public feeds at request time,
            deduplicated by title, ranked by community score and recency, then
            classified against four impact dimensions and fifteen focus topics
            using a curated keyword lexicon. Each event is structured into a 5W1H
            exhibit with forward-looking questions generated from
            topic-specific heuristics.
          </p>
          <table className="report-table mt-4 w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-muted">
                <th className="py-1.5">Source</th>
                <th className="py-1.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SOURCES).map((s) => {
                const ok = report.sourcesUsed.includes(s.id);
                return (
                  <tr key={s.id}>
                    <td className="py-1.5 text-ink-soft">
                      <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                        style={{ background: s.accent }}
                      />
                      {s.label}
                    </td>
                    <td className="py-1.5 text-right tnum">
                      {ok ? (
                        <span className="text-emerald-400">● live</span>
                      ) : (
                        <span className="text-amber-400">○ unavailable</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-[11px] text-muted sm:flex-row sm:px-8">
          <span>
            Data Insights — Daily Founder &amp; Innovator Briefing ·{" "}
            <span className="tnum">{report.date}</span>
          </span>
          <span className="tnum">
            {report.totalEvents} signals · {report.sourcesUsed.length}{" "}
            sources · classified 5W1H
          </span>
        </div>
      </footer>
    </section>
  );
}
