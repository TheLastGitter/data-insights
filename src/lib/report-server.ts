import { ingestAll } from "./ingest";
import { synthesizeReport } from "./synthesize";
import { clearCachedReport, getCachedReport, setCachedReport } from "./cache";
import type { DailyReport } from "./types";

export async function loadDailyReport(options?: { force?: boolean }): Promise<DailyReport> {
  if (options?.force) clearCachedReport();
  const cached = getCachedReport();
  if (cached) return cached;
  const { events, sourcesUsed, sourcesFailed } = await ingestAll();
  const report = await synthesizeReport(events, sourcesUsed, sourcesFailed);
  setCachedReport(report);
  return report;
}
