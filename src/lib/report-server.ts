import { ingestAll } from "./ingest";
import { synthesizeReport } from "./synthesize";
import { getCachedReport, setCachedReport } from "./cache";
import type { DailyReport } from "./types";

export async function loadDailyReport(): Promise<DailyReport> {
  const cached = getCachedReport();
  if (cached) return cached;
  const { events, sourcesUsed, sourcesFailed } = await ingestAll();
  const report = synthesizeReport(events, sourcesUsed, sourcesFailed);
  setCachedReport(report);
  return report;
}
