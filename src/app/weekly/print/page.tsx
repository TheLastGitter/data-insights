import { loadDailyReport } from "@/lib/report-server";
import { buildWeeklyReport } from "@/lib/weekly";
import { SOURCES } from "@/lib/types";
import "./print.css";

export const dynamic = "force-dynamic";

export default async function WeeklyPrintPage() {
  const report = buildWeeklyReport(await loadDailyReport());
  return <main className="print-report"><header className="print-cover"><div className="kicker">Data Insights / Weekly Intelligence Review</div><h1>The signal surface<br /><em>over seven days.</em></h1><p>{report.executiveThesis}</p><div className="cover-meta">{report.weekStart} — {report.weekEnd} · {report.totalSignals} signals · {report.sourceCount} sources</div></header><section><h2>What deserves a decision</h2><div className="print-grid">{report.recommendations.map((r) => <article key={r.title}><div className="kicker">{r.type} · {r.confidence} confidence</div><h3>{r.title}</h3><p>{r.rationale}</p><strong>Next step</strong><p>{r.nextStep}</p></article>)}</div></section><section><h2>Themes with momentum</h2><div className="print-grid four">{report.themes.map((t) => <article key={t.name}><h3>{t.name}</h3><p>{t.count} mentions · {t.momentum}</p><p>{t.whyItMatters}</p></article>)}</div></section><section><h2>Evidence coverage</h2><table><thead><tr><th>Source</th><th>Signals</th></tr></thead><tbody>{report.sourceCoverage.map((s) => <tr key={s.source}><td>{SOURCES[s.source].label}</td><td>{s.count}</td></tr>)}</tbody></table></section><section><h2>Questions for next week</h2><ol>{report.carryForward.map((q) => <li key={q}>{q}</li>)}</ol></section><footer>Data Insights · Generated {new Date(report.generatedAt).toLocaleString()}</footer></main>;
}
