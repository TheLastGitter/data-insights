import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { loadDailyReport } from "@/lib/report-server";
import { buildWeeklyReport } from "@/lib/weekly";
import { buildAnalystBrief } from "@/lib/analyst";
import { SOURCES } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const typeStyles = {
  opportunity: { label: "Opportunity", color: "#2e7d5b", icon: "↗" },
  risk: { label: "Risk", color: "#b04a4a", icon: "!" },
  experiment: { label: "Experiment", color: "#b88b3d", icon: "◇" },
};

export default async function WeeklyPage() {
  const daily = await loadDailyReport();
  const weekly = buildWeeklyReport(daily);
  const analyst = buildAnalystBrief(daily, weekly);
  const start = new Date(weekly.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const end = new Date(weekly.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <main className="min-h-full bg-background">
      <SiteNav />
      <header className="hero-grid border-b border-white/10 text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/50">
            <span className="text-gold-soft">Weekly intelligence review</span>
            <span>{start} — {end}</span>
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-gold-soft"><span className="h-px w-8 bg-gold" />Week in review</div>
              <h1 className="mt-4 max-w-4xl font-serif-display text-5xl font-medium leading-[1.02] md:text-7xl">The signal surface<br /><span className="text-gold-soft">over seven days.</span></h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/65">{weekly.executiveThesis}</p>
            </div>
            <div className="border-l border-white/15 pl-6">
              <div className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">Weekly snapshot</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Signals" value={weekly.totalSignals} />
                <Stat label="Sources" value={weekly.sourceCount} />
                <Stat label="Active topics" value={weekly.activeTopics} />
                <Stat label="Recommendations" value={weekly.recommendations.length} />
              </div>
            </div>
          </div>
          <div className="mt-9 border-t border-white/10 pt-4 text-xs text-white/50">Decision posture: <span className="font-semibold capitalize text-gold-soft">{analyst.posture}</span> · {analyst.headline}</div>
        </div>
      </header>

      <section className="border-b border-rule bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <SectionTitle eyebrow="01 / Analyst view" title="What deserves a decision" description={analyst.summary} />
          <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {weekly.recommendations.map((r) => {
              const style = typeStyles[r.type];
              return <article key={r.title} className="paper-card paper-card-hover p-5"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: style.color }}>{style.icon} {style.label}</span><span className="text-[10px] uppercase tracking-[0.15em] text-muted">{r.confidence} confidence</span></div><h3 className="mt-4 font-serif-display text-xl font-semibold text-ink">{r.title}</h3><p className="mt-3 text-[13px] leading-6 text-ink-soft">{r.rationale}</p><div className="mt-5 border-t border-rule pt-4"><div className="text-[10px] uppercase tracking-[0.15em] text-muted">Recommended next step</div><p className="mt-1 text-[12.5px] leading-5 text-ink">{r.nextStep}</p></div></article>;
            })}
          </div>
        </div>
      </section>

      <section className="section-wash border-b border-rule">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <SectionTitle eyebrow="02 / Pattern review" title="Themes with momentum" description="Recurring words and topics are treated as pattern candidates. Momentum is a review priority, not a prediction." />
          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {weekly.themes.map((theme, i) => <article key={theme.name} className="paper-card p-5"><div className="flex items-start justify-between"><span className="font-serif-display text-3xl text-gold-soft">{String(i + 1).padStart(2, "0")}</span><span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${theme.momentum === "rising" ? "bg-emerald-50 text-emerald-700" : theme.momentum === "steady" ? "bg-amber-50 text-amber-700" : "bg-surface-2 text-muted"}`}>{theme.momentum}</span></div><h3 className="mt-5 text-xl font-semibold capitalize text-ink">{theme.name}</h3><div className="mt-2 text-[12px] text-ink-soft">{theme.count} mentions · {theme.share}% of signals</div><p className="mt-4 border-t border-rule pt-3 text-[12px] leading-5 text-ink-soft">{theme.whyItMatters}</p></article>)}
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2">
          <div><SectionTitle eyebrow="03 / Coverage" title="Where evidence came from" description="A source-weighted view of this week's signal surface." /><div className="mt-6 space-y-3">{weekly.sourceCoverage.map((s) => <div key={s.source} className="flex items-center gap-3"><span className="w-32 truncate text-sm text-ink">{SOURCES[s.source].label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full" style={{ width: `${Math.max(s.share, 3)}%`, background: SOURCES[s.source].accent }} /></div><span className="w-9 text-right text-xs text-muted">{s.count}</span></div>)}</div></div>
          <div><SectionTitle eyebrow="04 / Focus" title="Topic distribution" description="The domains where the most activity accumulated." /><div className="mt-6 space-y-3">{weekly.topicCoverage.slice(0, 9).map((t) => <div key={t.topic} className="flex items-center gap-3"><span className="w-44 truncate text-sm text-ink">{t.topic}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-indigo" style={{ width: `${Math.max((t.count / Math.max(weekly.totalSignals, 1)) * 100, 3)}%` }} /></div><span className="w-9 text-right text-xs text-muted">{t.count}</span></div>)}</div></div>
        </div>
      </section>

      <section className="section-wash"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]"><div><SectionTitle eyebrow="05 / Carry forward" title="Questions for next week" description="Prompts designed to turn observation into a better decision loop." /><ol className="mt-6 space-y-4">{weekly.carryForward.map((q, i) => <li key={q} className="flex gap-4 border-b border-rule pb-4 font-serif-display text-xl leading-snug text-ink"><span className="text-sm text-gold tnum">{String(i + 1).padStart(2, "0")}</span><span>{q}</span></li>)}</ol></div><div className="paper-card self-start bg-navy p-6 text-white"><div className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">Methodology note</div><p className="mt-4 text-sm leading-6 text-white/65">{weekly.methodology}</p><Link href="/report" className="mt-6 inline-flex text-sm font-medium text-gold-soft underline decoration-gold underline-offset-4">Open the daily report →</Link></div></div></div></section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) { return <div className="border border-white/10 bg-white/[0.04] p-3"><div className="text-[10px] uppercase tracking-[0.15em] text-white/45">{label}</div><div className="mt-1 font-serif-display text-2xl text-white tnum">{value}</div></div>; }
function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="max-w-2xl"><div className="text-[11px] uppercase tracking-[0.24em] text-gold">{eyebrow}</div><h2 className="mt-3 font-serif-display text-4xl font-semibold leading-tight text-ink md:text-5xl">{title}</h2><p className="mt-3 text-[15px] leading-6 text-ink-soft">{description}</p></div>; }
