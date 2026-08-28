import type { DailyReport } from "./types";
import { recordAvailability } from "./uptime";
import { saveDailyReport } from "./storage";

// Short-lived in-memory cache so the live preview probe and rapid reloads
// don't re-fetch every source on every request (each cold fetch is ~5s).
// Cache validity is short (60s) to keep the report "daily/live" in spirit.
const TTL_MS = 120_000; // 2 min — more sources now, keep ingress off the hot path.
let cached: { report: DailyReport; at: number } | null = null;

export function getCachedReport(): DailyReport | null {
  if (!cached) return null;
  if (Date.now() - cached.at > TTL_MS) {
    cached = null;
    return null;
  }
  return cached.report;
}

export function setCachedReport(report: DailyReport): void {
  cached = { report, at: Date.now() };
  // Record source availability for uptime tracking.
  recordAvailability(report.sourcesUsed, report.sourcesFailed);
  void saveDailyReport(report);
}

export function clearCachedReport(): void {
  cached = null;
}
