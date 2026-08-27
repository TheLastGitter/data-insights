import type { DailyReport, ImpactDimension } from "@/lib/types";
import { EventCard } from "./EventCard";

const DIM_BLURB: Record<ImpactDimension, string> = {
  "Information Security":
    "Threats, vulnerabilities, breaches, and compliance signals that may shift your risk posture.",
  Technology:
    "Platform, infra, and ecosystem shifts that could reshape build vs. buy decisions.",
  Innovation:
    "Funding, research, and product signals indicating where the frontier is moving.",
  "Lifestyle & Hacks":
    "Behavior, workflow, and consumer-trend signals that hint at demand shifts.",
};

/**
 * Impact sections: each dimension renders as a numbered section with a blurb
 * and a grid of EventCard exhibits.
 */
export function ImpactSections({ report }: { report: DailyReport }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      {report.byImpact.map((section, i) => (
        <section key={section.dimension} className="mt-10 first:mt-0">
          <div className="flex items-baseline justify-between border-b border-rule pb-3">
            <div className="flex items-baseline gap-3">
              <span className="font-serif-display text-sm text-gold tnum">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-serif-display text-2xl font-semibold text-ink">
                {section.dimension}
              </h2>
            </div>
            <span className="tnum text-xs text-muted">
              {section.events.length} signal{section.events.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-ink-soft">
            {DIM_BLURB[section.dimension]}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            {section.events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
