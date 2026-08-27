import type { DailyReport } from "./types";
import type { WeeklyRecommendation, WeeklyReport } from "./weekly";

export interface AnalystBrief {
  generatedAt: number;
  posture: "explore" | "protect" | "focus";
  headline: string;
  summary: string;
  recommendations: WeeklyRecommendation[];
  decisionChecks: string[];
  engine: "llm" | "heuristic";
  model?: string;
}

export function buildAnalystBrief(report: DailyReport, weekly?: WeeklyReport): AnalystBrief {
  const topTopic = report.byTopic[0]?.topic ?? "Technology";
  const security = report.events.filter((e) => e.impacts.includes("Information Security")).length;
  const innovation = report.events.filter((e) => e.impacts.includes("Innovation")).length;
  const posture = security > innovation ? "protect" : innovation > security ? "explore" : "focus";
  const sourceCount = report.sourcesUsed.length;
  return {
    generatedAt: Date.now(),
    posture,
    headline: posture === "protect" ? "Protect the core while the signal surface accelerates." : posture === "explore" ? "Explore the frontier before it becomes table stakes." : "Focus the portfolio around the signals with evidence behind them.",
    summary: `The current surface is strongest around ${topTopic}. ${sourceCount} sources are contributing evidence; ${security} security-related signals and ${innovation} innovation signals deserve explicit decisions rather than passive monitoring.`,
    recommendations: weekly?.recommendations ?? [],
    decisionChecks: [
      "What would have to be true for this signal to matter to our customers?",
      "What evidence would disconfirm our current interpretation?",
      "Who owns the next decision, and by when?",
      "Are we creating a reversible experiment or an irreversible commitment?",
    ],
    engine: "heuristic",
  };
}

/**
 * Optional LLM enrichment. The product remains useful without credentials:
 * deterministic recommendations are always returned when the provider is absent
 * or unavailable. Set OPENAI_API_KEY to enable a concise analyst pass.
 */
export async function buildAnalystBriefWithOptionalLLM(
  report: DailyReport,
  weekly: WeeklyReport,
): Promise<AnalystBrief> {
  const fallback = buildAnalystBrief(report, weekly);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback;

  const model = process.env.OPENAI_ANALYST_MODEL ?? "gpt-4.1-mini";
  const evidence = weekly.events.slice(0, 18).map((event) => ({
    title: event.title,
    source: event.source,
    topics: event.topics,
    impacts: event.impacts,
  }));
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        input: `You are a cautious founder intelligence analyst. Use only the evidence below. Return JSON with keys headline, summary, posture (explore|protect|focus), recommendations (array of {type,title,rationale,nextStep,confidence,evidence}), and decisionChecks (array of strings). Do not invent facts. Evidence: ${JSON.stringify(evidence)}`,
        text: { format: { type: "json_object" } },
        max_output_tokens: 1800,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return fallback;
    const payload = await response.json() as { output_text?: string };
    const parsed = JSON.parse(payload.output_text ?? "{}");
    if (!parsed.headline || !Array.isArray(parsed.recommendations)) return fallback;
    return { ...fallback, ...parsed, generatedAt: Date.now(), engine: "llm", model } as AnalystBrief;
  } catch {
    return fallback;
  }
}
