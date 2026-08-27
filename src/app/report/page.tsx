import { ingestAll } from "@/lib/ingest";
import { synthesizeReport } from "@/lib/synthesize";
import { getCachedReport, setCachedReport } from "@/lib/cache";
import { BriefingHero } from "@/components/report/BriefingHero";
import { ReportCharts } from "@/components/report/ReportCharts";
import { TopThemes } from "@/components/report/TopThemes";
import { FocusTopics } from "@/components/report/FocusTopics";
import { ImpactSections } from "@/components/report/ImpactSections";
import { KeyQuestions } from "@/components/report/KeyQuestions";
import { SiteNav } from "@/components/SiteNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportPage() {
  let report = getCachedReport();
  if (!report) {
    const { events, sourcesUsed, sourcesFailed } = await ingestAll();
    report = synthesizeReport(events, sourcesUsed, sourcesFailed);
    setCachedReport(report);
  }

  if (report.totalEvents === 0) {
    return (
      <main className="min-h-full">
        <SiteNav />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-serif-display text-3xl font-semibold text-navy">
            No signals available
          </h1>
          <p className="mt-3 text-sm text-muted">
            All configured public sources were unavailable at generation time.
            This is usually transient — try again in a moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full">
      <SiteNav />
      <BriefingHero report={report} />
      <div className="no-print border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <span className="text-xs text-muted">A live decision brief assembled from public signals.</span>
          <div className="flex gap-2">
            <a href="/weekly/print" target="_blank" className="border border-rule px-3 py-2 text-xs font-medium text-indigo hover:border-gold">Print / PDF ↗</a>
            <a href="/weekly" className="bg-navy px-3 py-2 text-xs font-medium text-white hover:bg-indigo">Weekly review →</a>
          </div>
        </div>
      </div>
      <ReportCharts report={report} />
      <TopThemes report={report} />
      <FocusTopics report={report} />
      <ImpactSections report={report} />
      <KeyQuestions report={report} />
    </main>
  );
}
