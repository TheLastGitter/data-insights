import type { DailyReport } from "@/lib/types";

export function TopThemes({ report }: { report: DailyReport }) {
  if (report.topThemes.length === 0) return null;
  return (
    <section className="border-y border-white/10 bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-gold">
          Top recurring themes today
        </h3>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {report.topThemes.map((t) => (
            <li
              key={t.theme}
              className="font-serif-display text-lg capitalize text-white/90"
            >
              {t.theme}
              <span className="ml-1.5 tnum text-sm text-gold">{t.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
