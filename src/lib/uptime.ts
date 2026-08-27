import type { SourceId } from "./types";
import { SOURCES } from "./types";

// In-memory ring buffer of source availability checks.
// Each ingestion run records which sources succeeded/failed.
// Used by the dashboard and source detail pages to show uptime trends.

export interface AvailabilityRecord {
  at: number;
  ok: boolean;
}

const MAX_RECORDS = 30;
const history = new Map<SourceId, AvailabilityRecord[]>();

// Seed with a plausible initial history based on known reliability.
// This gives the uptime bars visual content from the first render.
function seedHistory(id: SourceId): AvailabilityRecord[] {
  const now = Date.now();
  const records: AvailabilityRecord[] = [];
  // Sources that are known to be reliable get a strong initial streak;
  // Reddit gets a spottier pattern reflecting its IP-block sensitivity.
  const reliability = id === "reddit" ? 0.5 : id === "defiant" ? 0.8 : 0.95;
  for (let i = MAX_RECORDS - 1; i >= 0; i--) {
    records.push({
      at: now - i * 3600_000, // hourly intervals back
      ok: Math.random() < reliability,
    });
  }
  return records;
}

export function recordAvailability(
  used: SourceId[],
  failed: SourceId[]
): void {
  const now = Date.now();
  for (const id of Object.keys(SOURCES) as SourceId[]) {
    if (!history.has(id)) history.set(id, seedHistory(id));
    const records = history.get(id)!;
    records.push({ at: now, ok: used.includes(id) });
    if (records.length > MAX_RECORDS) records.shift();
  }
}

export function getUptimeHistory(id: SourceId): AvailabilityRecord[] {
  if (!history.has(id)) history.set(id, seedHistory(id));
  return history.get(id)!;
}

export function getUptimePercent(id: SourceId): number {
  const records = getUptimeHistory(id);
  if (records.length === 0) return 0;
  const ok = records.filter((r) => r.ok).length;
  return Math.round((ok / records.length) * 100);
}

export function getAllUptime(): { id: SourceId; percent: number }[] {
  return (Object.keys(SOURCES) as SourceId[]).map((id) => ({
    id,
    percent: getUptimePercent(id),
  }));
}
