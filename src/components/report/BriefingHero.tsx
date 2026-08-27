import type { DailyReport } from "@/lib/types";
import { SOURCES } from "@/lib/types";

function fmtDate(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BriefingHero({ report }: { report: DailyReport }) {
  return (
    <header className="hero-grid overflow-hidden border-b border-white/10 text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-white/50">
          <span className="text-gold-soft">Daily insights / field note</span>
          <span className="tnum">{report.date}</span>
        </div>
        <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_310px] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-gold-soft">
              <span className="h-px w-8 bg-gold" />
              Founder &amp; innovator briefing
            </div>
            <h1 className="max-w-4xl font-serif-display text-4xl font-medium leading-[1.02] md:text-6xl">
              The Scout Report
              <span className="block text-gold-soft">What is moving now.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] leading-7 text-white/65">
              A concise field note on the signals, technologies, risks, and opportunities most likely to shape the next operating cycle.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/55">
              {report.topThemes.slice(0, 4).map((theme) => (
                <span key={theme.theme} className="border border-white/15 bg-white/[0.04] px-2.5 py-1">
                  {theme.theme} <span className="text-gold-soft">{theme.count}</span>
                </span>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 border-l border-white/15 pl-6 lg:grid-cols-1">
            <Stat label="Signals reviewed" value={report.totalEvents} />
            <Stat label="Live sources" value={report.sourcesUsed.length} />
            <Stat label="Impact vectors" value={report.byImpact.length} />
            <Stat label="Top themes" value={report.topThemes.length} />
          </dl>
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[11px] text-white/50">
          <span className="uppercase tracking-[0.18em] text-gold-soft">Provenance</span>
          {report.sourcesUsed.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: SOURCES[s].accent }} />
              {SOURCES[s].label}
            </span>
          ))}
          {report.sourcesFailed.length > 0 && <span className="text-amber-300">Unavailable: {report.sourcesFailed.map((s) => SOURCES[s].label).join(", ")}</span>}
          <span className="ml-auto tnum">Generated {fmtDate(report.generatedAt)}</span>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="border border-white/10 bg-white/[0.035] p-3"><dt className="text-[10px] uppercase tracking-[0.15em] text-white/45">{label}</dt><dd className="mt-1 font-serif-display text-2xl text-white tnum">{value}</dd></div>;
}
