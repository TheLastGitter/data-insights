"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyReport, ImpactDimension } from "@/lib/types";
import { IMPACT_DIMENSIONS, SOURCES } from "@/lib/types";

const IMPACT_COLOR: Record<ImpactDimension, string> = {
  "Information Security": "#b3122d",
  Technology: "#3b82f6",
  Innovation: "#d4a64a",
  "Lifestyle & Hacks": "#2e7d5b",
};

export function ReportCharts({ report }: { report: DailyReport }) {
  const impactData = IMPACT_DIMENSIONS.map((d) => ({
    name: d,
    count: report.events.filter((e) => e.impacts.includes(d)).length,
    color: IMPACT_COLOR[d],
  })).filter((d) => d.count > 0);

  const sourceData = report.bySource.map((s) => ({
    name: SOURCES[s.source].label,
    count: s.count,
    color: SOURCES[s.source].accent,
  }));

  return (
    <section className="border-b border-rule bg-surface-2">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 sm:px-8 md:grid-cols-2">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.24em] text-gold">
            Signals by impact dimension
          </h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactData} margin={{ left: -10, right: 8, top: 8 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#7a8499" }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fontSize: 11, fill: "#7a8499" }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "#161e30",
                    color: "#e8eaf0",
                  }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {impactData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-[0.24em] text-gold">
            Source distribution
          </h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {sourceData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "#161e30",
                    color: "#e8eaf0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
            {sourceData.map((d) => (
              <li key={d.name} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: d.color }}
                />
                {d.name} <span className="tnum">({d.count})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
