import Link from "next/link";
import { ingestAll } from "@/lib/ingest";
import { synthesizeReport } from "@/lib/synthesize";
import { getCachedReport, setCachedReport } from "@/lib/cache";
import { SOURCES } from "@/lib/types";
import type { Topic } from "@/lib/types";
import { SOURCE_ASSESSMENTS, TOPIC_TAXONOMY } from "@/lib/sourceAssessments";
import { getUptimePercent } from "@/lib/uptime";
import { SiteNav } from "@/components/SiteNav";
import { topicColor } from "@/components/report/TopicBadge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const QUALITY_COLOR: Record<string, string> = {
  high: "#2e7d5b",
  medium: "#a8752d",
  variable: "#b04a4a",
};

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function DashboardPage() {
  let report = getCachedReport();
  if (!report) {
    const { events, sourcesUsed, sourcesFailed } = await ingestAll();
    report = synthesizeReport(events, sourcesUsed, sourcesFailed);
    setCachedReport(report);
  }

  return (
    <main className="min-h-full">
      <SiteNav />

      <header className="hero-grid overflow-hidden border-b border-white/10 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gold-soft">
            <span className="h-px w-10 bg-gold" />
            Founder intelligence platform
          </div>
          <div className="mt-7 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-serif-display text-5xl font-medium leading-[0.98] tracking-tight sm:text-6xl lg:text-[4.35rem]">
                See what is moving before it moves you.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/65">
                Data Insights turns noisy public signals into a daily decision
                surface for founders and innovators — with source provenance,
                topic context, and questions worth carrying forward.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/report" className="gold-gradient inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold text-navy-deep shadow-lg transition hover:-translate-y-0.5">
                  Read today&apos;s briefing <span>→</span>
                </Link>
                <Link href="/command-center" className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-3 text-sm text-white/80 transition hover:border-gold hover:text-gold">
                  Open command center
                </Link>
                <a href="#sources" className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-3 text-sm text-white/80 transition hover:border-gold hover:text-gold">
                  Explore the signal map
                </a>
              </div>
            </div>
            <div className="border-l border-white/15 pl-7 lg:pb-2">
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold-soft">Today at a glance</div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <HeroStat label="Signals reviewed" value={report.totalEvents} />
                <HeroStat label="Live sources" value={`${report.sourcesUsed.length}/${SOURCE_ASSESSMENTS.length}`} />
                <HeroStat label="Themes detected" value={report.byTopic.length} />
                <HeroStat label="Questions generated" value={report.keyQuestions.length} />
              </div>
              <p className="mt-5 text-xs leading-5 text-white/45">
                Last assembled {new Date(report.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}. Source health and availability are recorded with every run.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section id="sources" className="bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <SectionHeading eyebrow="01 / Signal provenance" title="The source registry" description="Every source is assessed before it becomes part of the briefing. Follow a source to see its evidence, bias profile, coverage, and availability history." />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SOURCE_ASSESSMENTS.map((s, i) => {
              const meta = SOURCES[s.id];
              const ok = report.sourcesUsed.includes(s.id);
              const uptime = getUptimePercent(s.id);
              return (
                <Link key={s.id} href={`/sources/${s.id}`} className="paper-card paper-card-hover animate-fade-up group block p-5" style={{ animationDelay: `${i * 25}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full ring-4 ring-background" style={{ background: meta.accent }} />
                      <h3 className="font-serif-display text-lg font-semibold text-ink">{meta.label}</h3>
                    </div>
                    <span className={`text-[11px] font-medium ${ok ? "text-emerald-700" : "text-amber-700"}`}>
                      {ok ? "● live" : "○ down"}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[12.5px] leading-5 text-ink-soft">{s.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.coverage.slice(0, 4).map((t) => <span key={t} className="rounded-full px-2 py-1 text-[10px] font-medium" style={{ color: topicColor(t as Topic), background: `${topicColor(t as Topic)}12` }}>{t}</span>)}
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-rule pt-4">
                    <MiniStat label="Quality" value={s.reliability.quality} color={QUALITY_COLOR[s.reliability.quality]} />
                    <MiniStat label="Cadence" value={s.cadence} />
                    <MiniStat label="Events" value={report.events.filter((e) => e.source === s.id).length.toString()} />
                  </div>
                  <div className="mt-4 border-t border-rule pt-3">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.13em] text-muted"><span>Availability</span><span className="tnum text-ink-soft">{uptime}%</span></div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full" style={{ width: `${uptime}%`, background: uptime >= 90 ? "#2e7d5b" : uptime >= 60 ? "#b88b3d" : "#b04a4a" }} /></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-medium text-indigo"><span>View assessment</span><span className="transition group-hover:translate-x-1">↗</span></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="topics" className="section-wash border-y border-rule">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <SectionHeading eyebrow="02 / The signal map" title="Themes worth watching" description={`${TOPIC_TAXONOMY.length} domains, ${TOPIC_TAXONOMY.reduce((n, t) => n + t.subThemes.length, 0)} sub-themes, one connected view of where change is accumulating.`} />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOPIC_TAXONOMY.map((entry, i) => {
              const color = topicColor(entry.topic);
              const todayCount = report.byTopic.find((t) => t.topic === entry.topic)?.events.length ?? 0;
              return (
                <Link key={entry.topic} href={`/topics/${slugify(entry.topic)}`} className="paper-card paper-card-hover group block p-5" style={{ animationDelay: `${i * 25}ms` }}>
                  <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className="h-3 w-3 rounded-full" style={{ background: color }} /><h3 className="font-serif-display text-lg font-semibold" style={{ color }}>{entry.topic}</h3></div>{todayCount > 0 && <span className="rounded-full bg-surface-2 px-2 py-1 text-[10px] text-ink-soft">{todayCount} today</span>}</div>
                  <p className="mt-3 text-[12.5px] leading-5 text-ink-soft">{entry.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">{entry.subThemes.slice(0, 4).map((st) => <span key={st} className="rounded-sm border border-rule bg-background px-2 py-1 text-[10px] text-ink-soft">{st}</span>)}<span className="rounded-sm px-1 py-1 text-[10px] text-muted">+{entry.subThemes.length - 4}</span></div>
                  <div className="mt-5 flex items-center justify-between border-t border-rule pt-3 text-xs font-medium text-indigo"><span>Explore theme</span><span className="transition group-hover:translate-x-1">→</span></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="ink-gradient text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 sm:flex-row sm:items-center sm:px-8">
          <div><div className="font-serif-display text-2xl">Your next good question is waiting.</div><p className="mt-1 text-sm text-white/55">{report.totalEvents} signals · {report.sourcesUsed.length} sources · {report.byTopic.length} themes today</p></div>
          <div className="flex flex-wrap gap-3">
            <Link href="/report" className="gold-gradient rounded-sm px-5 py-3 text-sm font-semibold text-navy-deep transition hover:-translate-y-0.5">Open the daily report →</Link>
            <Link href="/weekly" className="border border-white/20 px-5 py-3 text-sm text-white transition hover:border-gold hover:text-gold">Open weekly →</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="max-w-2xl"><div className="text-[11px] uppercase tracking-[0.24em] text-gold">{eyebrow}</div><h2 className="mt-3 font-serif-display text-4xl font-semibold leading-tight text-ink md:text-5xl">{title}</h2><p className="mt-3 text-[15px] leading-6 text-ink-soft">{description}</p></div>;
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return <div className="border border-white/15 bg-white/[0.04] p-4"><div className="text-[10px] uppercase tracking-[0.15em] text-white/45">{label}</div><div className="mt-1 font-serif-display text-3xl text-white tnum">{value}</div></div>;
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return <div><div className="text-[9px] uppercase tracking-[0.13em] text-muted">{label}</div><div className="mt-1 truncate capitalize text-xs text-ink-soft" style={color ? { color } : undefined}>{value}</div></div>;
}
