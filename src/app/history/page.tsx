import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { listDailyReports } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const reports = await listDailyReports();
  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <header className="hero-grid border-b border-white/10 text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold-soft"><span className="h-px w-9 bg-gold" />Archive / intelligence history</div>
          <div className="mt-6 max-w-3xl">
            <h1 className="font-serif-display text-5xl font-medium tracking-tight md:text-6xl">The signal archive.</h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/65">A persistent record of generated daily reports — the longitudinal view of what changed, which themes accumulated, and when the evidence shifted.</p>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
            <ArchiveStat label="Reports saved" value={reports.length} />
            <ArchiveStat label="Cadence" value="Daily" />
            <ArchiveStat label="Format" value="JSON" />
          </div>
        </div>
      </header>
      <section>
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="text-[11px] uppercase tracking-[0.24em] text-gold">01 / Historical record</div><h2 className="mt-2 font-serif-display text-3xl font-semibold text-ink">Daily intelligence</h2></div><Link href="/weekly" className="text-sm font-medium text-indigo underline decoration-gold underline-offset-4">Open weekly synthesis →</Link></div>
          {reports.length ? <div className="grid gap-3 md:grid-cols-2">{reports.map((file, index) => { const date = file.replace("daily-", "").replace(".json", ""); return <a key={file} href={`/api/history/${date}`} className="paper-card paper-card-hover group flex items-center justify-between gap-4 p-5"><div className="flex items-center gap-4"><span className="font-serif-display text-2xl text-gold-soft tnum">{String(index + 1).padStart(2, "0")}</span><div><div className="font-serif-display text-xl text-ink">Daily report</div><div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{date}</div></div></div><span className="text-sm font-medium text-indigo transition group-hover:translate-x-1">View JSON ↗</span></a>; })}</div> : <div className="paper-card p-12 text-center"><div className="font-serif-display text-2xl text-ink">The archive is ready for its first entry.</div><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Opening the dashboard or daily report creates today&apos;s archive automatically.</p><Link href="/report" className="mt-6 inline-flex bg-navy px-4 py-2.5 text-sm font-medium text-white">Generate today&apos;s report →</Link></div>}
          <Link href="/" className="mt-10 inline-flex text-sm text-indigo underline decoration-gold underline-offset-4">← Back to overview</Link>
        </div>
      </section>
    </main>
  );
}

function ArchiveStat({ label, value }: { label: string; value: string | number }) { return <div className="border border-white/15 bg-white/[0.04] p-3"><div className="text-[10px] uppercase tracking-[0.15em] text-white/45">{label}</div><div className="mt-1 font-serif-display text-2xl text-white tnum">{value}</div></div>; }
