import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    name: "data-insights",
    version: "1.0",
    description: "Daily and weekly founder intelligence reports from public technology, startup, research, security, and industry sources.",
    authentication: "none for local/public development endpoint",
    endpoints: [
      { name: "daily_report", method: "GET", path: "/api/report", description: "Get the current daily report with events, 5W1H, topics, sources, and questions." },
      { name: "weekly_report", method: "GET", path: "/api/weekly", description: "Get the current weekly synthesis with themes, momentum, coverage, risks, opportunities, and experiments." },
      { name: "refresh_feed", method: "POST", path: "/api/refresh", description: "Clear cache, re-ingest sources, and re-run smart image lookup." },
      { name: "source_detail", method: "GET", path: "/sources/{id}", description: "Inspect source assessment, uptime, coverage, and recent events." },
      { name: "topic_detail", method: "GET", path: "/topics/{slug}", description: "Inspect topic sub-themes, source coverage, questions, and events." },
    ],
    mcp: {
      transport: "stdio adapter included at scripts/mcp-server.mjs",
      tools: ["get_daily_report", "get_weekly_report", "get_analyst_recommendations", "search_signals"],
    },
    cli: {
      command: "node scripts/data-insights.mjs",
      commands: ["daily", "weekly", "analyst", "search"],
    },
  });
}
