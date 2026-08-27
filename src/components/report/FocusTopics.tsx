import type { DailyReport } from "@/lib/types";
import { topicColor } from "./TopicBadge";

/**
 * Focus Topics strip: a compact overview of which focused topic areas
 * (AI, Robotics, Open Source, etc.) appear in today's report, with counts.
 */
export function FocusTopics({ report }: { report: DailyReport }) {
  if (report.byTopic.length === 0) return null;
  return (
    <section className="border-b border-rule bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
          Focus topics in today's report
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {report.byTopic.map((t) => (
            <li
              key={t.topic}
              className="inline-flex items-center gap-2 rounded-full border border-rule bg-background px-3 py-1.5 text-[12px]"
              style={{ color: topicColor(t.topic) }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: topicColor(t.topic) }}
              />
              <span className="font-medium">{t.topic}</span>
              <span className="tnum text-muted">{t.events.length}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
