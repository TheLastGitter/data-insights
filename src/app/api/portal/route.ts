import { NextResponse } from "next/server";
import { loadDailyReport } from "@/lib/report-server";
import { portalCard, UNLICENSED_SURFACE } from "@/lib/rights";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await loadDailyReport();
  return NextResponse.json(
    {
      rights: UNLICENSED_SURFACE,
      date: report.date,
      generatedAt: report.generatedAt,
      sourcesUsed: report.sourcesUsed,
      sourcesFailed: report.sourcesFailed,
      cards: report.events.map(portalCard),
    },
    {
      headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" },
    },
  );
}
