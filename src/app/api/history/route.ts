import { NextResponse } from "next/server";
import { listDailyReports } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ reports: await listDailyReports() });
}
