#!/usr/bin/env node

const base = process.env.DATA_INSIGHTS_URL || "http://localhost:3000";

async function get(path) {
  const response = await fetch(`${base}${path}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function result(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

async function handle(message) {
  if (message.method === "initialize") {
    return { jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "data-insights", version: "1.0.0" } } };
  }
  if (message.method === "notifications/initialized") return null;
  if (message.method === "tools/list") {
    return { jsonrpc: "2.0", id: message.id, result: { tools: [
      { name: "get_daily_report", description: "Get today's synthesized founder intelligence report.", inputSchema: { type: "object", properties: {} } },
      { name: "get_weekly_report", description: "Get the weekly synthesis with themes, risks, opportunities, and experiments.", inputSchema: { type: "object", properties: {} } },
      { name: "get_analyst_recommendations", description: "Get explainable analyst posture and recommendations.", inputSchema: { type: "object", properties: {} } },
      { name: "search_signals", description: "Search today's signals by keyword, topic, or source.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search term" } }, required: ["query"] } },
    ] } };
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    if (name === "get_daily_report") return { jsonrpc: "2.0", id: message.id, result: result(await get("/api/report")) };
    if (name === "get_weekly_report") return { jsonrpc: "2.0", id: message.id, result: result(await get("/api/weekly")) };
    if (name === "get_analyst_recommendations") return { jsonrpc: "2.0", id: message.id, result: result(await get("/api/analyst")) };
    if (name === "search_signals") {
      const daily = await get("/api/report");
      const query = String(message.params?.arguments?.query || "").toLowerCase();
      const events = daily.events.filter((event) => `${event.title} ${event.summary} ${event.topics.join(" ")} ${event.source}`.toLowerCase().includes(query));
      return { jsonrpc: "2.0", id: message.id, result: result(events) };
    }
    return { jsonrpc: "2.0", id: message.id, error: { code: -32602, message: `Unknown tool: ${name}` } };
  }
  return { jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Method not found" } };
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    try {
      const response = await handle(JSON.parse(line));
      if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
    } catch (error) {
      process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: error.message } })}\n`);
    }
  }
});
