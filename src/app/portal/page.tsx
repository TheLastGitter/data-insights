import { SiteNav } from "@/components/SiteNav";
import { PortalCard } from "@/components/portal/PortalCard";
import { RefreshButton } from "@/components/portal/RefreshButton";
import { loadDailyReport } from "@/lib/report-server";
import { SOURCES } from "@/lib/types";
import type { ReportEvent } from "@/lib/types";
import { UNLICENSED_SURFACE } from "@/lib/rights";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function orderForPhotos(events: ReportEvent[]): ReportEvent[] {
  const withPhoto = events.filter((event) => event.imageUrl);
  const without = events.filter((event) => !event.imageUrl);
  return [...withPhoto, ...without];
}

export default async function PortalPage() {
  const report = await loadDailyReport();
  const ordered = orderForPhotos(report.events);
  const [hero, ...rest] = ordered;
  const side = rest.slice(0, 5);
  const river = rest.slice(5);
  const photoCount = report.events.filter((event) => event.imageUrl).length;

  return (
    <main className="min-h-full bg-background">
      <SiteNav />
      <div className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <h1 className="font-serif-display text-2xl font-semibold tracking-tight text-ink">
            Top stories
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-muted">
              {photoCount} photos · {report.sourcesUsed.length} sources ·{" "}
              {new Date(report.generatedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <RefreshButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {hero ? (
          <section className="grid gap-0 border border-rule bg-surface lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
            <PortalCard event={hero} variant="hero" />
            <div className="px-4 py-2">
              {side.map((event) => (
                <PortalCard key={event.id} event={event} variant="row" />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-ink-soft">No live sources responded.</p>
        )}

        {river.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              More from the feeds
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {river.map((event) => (
                <PortalCard key={event.id} event={event} variant="tile" />
              ))}
            </div>
          </section>
        ) : null}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4 text-[11px] text-muted">
          <p>{UNLICENSED_SURFACE.notice}</p>
          <div className="flex gap-4">
            {report.bySource.slice(0, 8).map((row) => (
              <span key={row.source} style={{ color: SOURCES[row.source].accent }}>
                {SOURCES[row.source].label}
              </span>
            ))}
            <Link href="/report" className="text-indigo underline underline-offset-2">
              5W1H briefing
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
