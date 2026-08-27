import { NextResponse } from "next/server";
import { loadDailyReport } from "@/lib/report-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await loadDailyReport();
  return NextResponse.json(report, {
    headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" },
  });
}
