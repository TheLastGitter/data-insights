import { NextResponse } from "next/server";
import { loadDailyReport } from "@/lib/report-server";
import { buildWeeklyReport } from "@/lib/weekly";
import { buildAnalystBriefWithOptionalLLM } from "@/lib/analyst";

export const dynamic = "force-dynamic";

export async function GET() {
  const daily = await loadDailyReport();
  const weekly = buildWeeklyReport(daily);
  return NextResponse.json(await buildAnalystBriefWithOptionalLLM(daily, weekly), {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" },
  });
}
