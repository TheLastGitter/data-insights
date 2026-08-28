import { NextResponse } from "next/server";
import { loadDailyReport } from "@/lib/report-server";
import { portalCard, UNLICENSED_SURFACE } from "@/lib/rights";

export const dynamic = "force-dynamic";

export async function POST() {
  const report = await loadDailyReport({ force: true });
  const withImages = report.events.filter((event) => event.imageUrl).length;
  return NextResponse.json({
    ok: true,
    generatedAt: report.generatedAt,
    totalEvents: report.totalEvents,
    withImages,
    rights: UNLICENSED_SURFACE,
    cards: report.events.map(portalCard),
  });
}
