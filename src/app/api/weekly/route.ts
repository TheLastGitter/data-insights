import { NextResponse } from "next/server";
import { loadDailyReport } from "@/lib/report-server";
import { buildWeeklyReport } from "@/lib/weekly";
import { saveWeeklyReport } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const daily = await loadDailyReport();
  const weekly = buildWeeklyReport(daily);
  void saveWeeklyReport(weekly);
  return NextResponse.json(weekly, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" },
  });
}
