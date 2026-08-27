import { NextResponse } from "next/server";
import { readDailyReport } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const report = await readDailyReport(date);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  return NextResponse.json(report);
}
