import Link from "next/link";
import { notFound } from "next/navigation";
import { SOURCES } from "@/lib/types";
import type { SourceId, Topic } from "@/lib/types";
import {
  SOURCE_ASSESSMENTS,
  TOPIC_TAXONOMY,
} from "@/lib/sourceAssessments";
import { getUptimeHistory, getUptimePercent } from "@/lib/uptime";
import { getCachedReport } from "@/lib/cache";
import { SiteNav } from "@/components/SiteNav";
import { topicColor } from "@/components/report/TopicBadge";
import { EventCard } from "@/components/report/EventCard";

const QUALITY_COLOR: Record<string, string> = {
  high: "#2e7d5b",
  medium: "#b08a3e",
  variable: "#b3122d",
};

export function generateStaticParams() {
  return Object.keys(SOURCES).map((id) => ({ id }));
}

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(id in SOURCES)) notFound();
  const sourceId = id as SourceId;
  const meta = SOURCES[sourceId];
  const assessment = SOURCE_ASSESSMENTS.find((s) => s.id === sourceId);
  if (!assessment) notFound();

  const report = getCachedReport();
  const uptime = getUptimePercent(sourceId);
  const history = getUptimeHistory(sourceId);
  const recentEvents = report
    ? report.events.filter((e) => e.source === sourceId)
    : [];

  // Sub-themes contributed to (from the taxonomy).
  const contributedTopics = assessment.coverage;
  const subThemesFromCoverage = TOPIC_TAXONOMY.filter((t) =>
    contributedTopics.includes(t.topic)
  ).flatMap((t) => t.subThemes.map((st) => ({ topic: t.topic, sub: st })));

  return (
    <main className="min-h-full bg-background">
      <SiteNav />
      <SourceHero
        meta={meta}
        description={assessment.description}
        uptime={uptime}
        ok={report?.sourcesUsed.includes(sourceId) ?? false}
      />

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        {/* Assessment grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AssessmentCard assessment={assessment} />
          <UptimeCard history={history} percent={uptime} />
        </div>

        {/* Coverage topics */}
        <section className="mt-10">
          <h2 className="font-serif-display text-2xl font-semibold text-ink">
            Coverage scope &amp; sub-themes
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Topics this source is assessed to cover, and the sub-themes it
            contributes to within each.
          </p>
          <div className="mt-4 space-y-4">
            {contributedTopics.map((topic) => {
              const tax = TOPIC_TAXONOMY.find((t) => t.topic === topic);
              if (!tax) return null;
              return (
                <div
                  key={topic}
                  className="paper-card p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: topicColor(topic as Topic) }}
                    />
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: topicColor(topic as Topic) }}
                    >
                      {topic}
                    </h3>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {tax.subThemes.map((st) => (
                      <li
                        key={st}
                        className="rounded-sm border border-rule bg-background px-2 py-1 text-[10px] text-ink-soft"
                      >
                        {st}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent events from this source */}
        {recentEvents.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif-display text-2xl font-semibold text-ink">
              Recent events from {meta.label}
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              {recentEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-indigo underline decoration-gold decoration-2 underline-offset-2 hover:text-gold"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function SourceHero({
  meta,
  description,
  uptime,
  ok,
}: {
  meta: { label: string; accent: string };
  description: string;
  uptime: number;
  ok: boolean;
}) {
  return (
    <header className="hero-grid border-b border-white/10 text-white">        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: meta.accent }}
          />
          Source Registry / {meta.label}
        </div>
        <h1 className="mt-4 font-serif-display text-3xl font-semibold text-white md:text-4xl">
          {meta.label}
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/70">
          {description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              ok
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {ok ? "● Live now" : "○ Currently unavailable"}
          </span>
          <span className="text-white/65">
            Uptime:{" "}                <span className="font-semibold text-gold-soft tnum">{uptime}%</span>
          </span>
        </div>
      </div>
    </header>
  );
}

function AssessmentCard({
  assessment,
}: {
  assessment: (typeof SOURCE_ASSESSMENTS)[number];
}) {
  return (
    <div className="paper-card p-5">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
        Source assessment
      </h3>
      <div className="report-table mt-3 w-full text-[12.5px]">
        <Row k="Signal type" v={assessment.reliability.type} />
        <Row
          k="Quality"
          v={assessment.reliability.quality}
          vColor={QUALITY_COLOR[assessment.reliability.quality]}
        />
        <Row k="Cadence" v={assessment.cadence} />
        <Row k="Access method" v={assessment.access.method} />
        <Row k="Auth" v={assessment.access.auth} />
        <Row k="Rate limit" v={assessment.access.rateLimit} />
      </div>
      <div className="mt-4 border-t border-rule pt-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
          Reliability &amp; bias
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-ink/75">
          <span className="font-medium text-ink/90">Bias:</span>{" "}
          {assessment.reliability.bias}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink/70">
          {assessment.reliability.notes}
        </p>
      </div>
      <div className="mt-3 border-t border-rule pt-3 text-[12px]">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
          Failure mode
        </span>
        <p className="mt-1 text-ink/70">{assessment.access.failureMode}</p>
      </div>
    </div>
  );
}

function UptimeCard({
  history,
  percent,
}: {
  history: { at: number; ok: boolean }[];
  percent: number;
}) {
  return (
    <div className="paper-card p-5">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
        Availability history
      </h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-serif-display text-3xl font-semibold text-navy tnum">
          {percent}%
        </span>
        <span className="text-xs text-muted">uptime (last {history.length} checks)</span>
      </div>
      {/* Uptime bars */}
      <div className="mt-4 flex items-end gap-0.5" style={{ height: 48 }}>
        {history.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: h.ok ? "100%" : "30%",
              background: h.ok ? "#2e7d5b" : "#b3122d",
              opacity: 0.4 + (i / history.length) * 0.6,
            }}
            title={`${new Date(h.at).toLocaleDateString()} ${h.ok ? "✓" : "✗"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>30 checks ago</span>
        <span>now</span>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  vColor,
}: {
  k: string;
  v: string;
  vColor?: string;
}) {
  return (
    <div className="flex justify-between border-b border-rule py-1.5">
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted">
        {k}
      </span>
      <span
        className="text-right capitalize"
        style={vColor ? { color: vColor } : undefined}
      >
        {v}
      </span>
    </div>
  );
}
