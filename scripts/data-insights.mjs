#!/usr/bin/env node

const base = process.env.DATA_INSIGHTS_URL || "http://localhost:3000";
const [command = "weekly", ...args] = process.argv.slice(2);

async function get(path) {
  const response = await fetch(`${base}${path}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

try {
  if (command === "daily") print(await get("/api/report"));
  else if (command === "weekly") print(await get("/api/weekly"));
  else if (command === "analyst") print(await get("/api/analyst"));
  else if (command === "capabilities") print(await get("/api/capabilities"));
  else if (command === "search") {
    const daily = await get("/api/report");
    const term = args.join(" ").toLowerCase();
    print(daily.events.filter((event) => `${event.title} ${event.summary} ${event.topics.join(" ")}`.toLowerCase().includes(term)));
  } else {
    throw new Error(`Unknown command: ${command}. Use daily, weekly, analyst, search, or capabilities.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
