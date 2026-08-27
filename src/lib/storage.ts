import fs from "node:fs/promises";
import path from "node:path";
import type { DailyReport } from "./types";
import type { WeeklyReport } from "./weekly";

const DATA_DIR = path.join(process.cwd(), ".data-insights");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function saveDailyReport(report: DailyReport): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, `daily-${report.date}.json`), JSON.stringify(report, null, 2), "utf8");
}

export async function saveWeeklyReport(report: WeeklyReport): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, `weekly-${report.weekStart}-${report.weekEnd}.json`), JSON.stringify(report, null, 2), "utf8");
}

export async function listDailyReports(): Promise<string[]> {
  try {
    const files = await fs.readdir(DATA_DIR);
    return files.filter((file) => file.startsWith("daily-") && file.endsWith(".json")).sort().reverse();
  } catch {
    return [];
  }
}

export async function readDailyReport(date: string): Promise<DailyReport | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, `daily-${date}.json`), "utf8")) as DailyReport;
  } catch {
    return null;
  }
}
