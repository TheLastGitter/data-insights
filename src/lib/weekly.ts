import type { DailyReport, ImpactDimension, ReportEvent, SourceId, Topic } from "./types";
import { IMPACT_DIMENSIONS, SOURCES, TOPICS } from "./types";

export interface WeeklyTheme {
  name: string;
  count: number;
  share: number;
  momentum: "rising" | "steady" | "watch";
  topics: Topic[];
  whyItMatters: string;
}

export interface WeeklyRecommendation {
  type: "opportunity" | "risk" | "experiment";
  title: string;
  rationale: string;
  nextStep: string;
  confidence: "high" | "medium";
  evidence: string[];
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  generatedAt: number;
  totalSignals: number;
  sourceCount: number;
  activeTopics: number;
  events: ReportEvent[];
  themes: WeeklyTheme[];
  sourceCoverage: { source: SourceId; count: number; share: number }[];
  topicCoverage: { topic: Topic; count: number }[];
  impactCoverage: { dimension: ImpactDimension; count: number }[];
  recommendations: WeeklyRecommendation[];
  executiveThesis: string;
  carryForward: string[];
  methodology: string;
}

function dateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function themeWhy(name: string): string {
  const map: Record<string, string> = {
    ai: "Capability, cost, and workflow shifts here can compound quickly into product and operating-model change.",
    model: "Model progress is a leading indicator for what software teams can automate next.",
    robot: "Embodied systems are moving from research demos toward constrained commercial environments.",
    open: "Open ecosystems can compress build costs while introducing governance and dependency decisions.",
    security: "Security signals can change risk posture before they become visible in business metrics.",
    chip: "Compute economics and supply-chain choices determine which AI and edge products are viable.",
    github: "Developer adoption is an early indicator of platform and ecosystem momentum.",
  };
  return map[name.toLowerCase()] ?? "A recurring signal across the review set that deserves a deliberate point of view.";
}

export function buildWeeklyReport(report: DailyReport): WeeklyReport {
  const { start, end } = dateRange();
  const total = report.events.length;
  const themes = report.topThemes.map((t, i) => {
    const normalized = t.theme.toLowerCase();
    const matchingTopics = TOPICS.filter((topic) =>
      report.events.some((e) => e.topics.includes(topic) && e.title.toLowerCase().includes(normalized))
    ).slice(0, 3);
    return {
      name: t.theme,
      count: t.count,
      share: total ? Math.round((t.count / total) * 100) : 0,
      momentum: i < 2 ? "rising" as const : i < 5 ? "steady" as const : "watch" as const,
      topics: matchingTopics,
      whyItMatters: themeWhy(t.theme),
    };
  });

  const sourceCoverage = report.bySource.map((s) => ({
    source: s.source,
    count: s.count,
    share: total ? Math.round((s.count / total) * 100) : 0,
  }));
  const topicCoverage = TOPICS.map((topic) => ({
    topic,
    count: report.events.filter((e) => e.topics.includes(topic)).length,
  })).filter((x) => x.count > 0).sort((a, b) => b.count - a.count);
  const impactCoverage = IMPACT_DIMENSIONS.map((dimension) => ({
    dimension,
    count: report.events.filter((e) => e.impacts.includes(dimension)).length,
  }));

  const topTopic = topicCoverage[0]?.topic ?? "Technology";
  const topSource = sourceCoverage[0] ? SOURCES[sourceCoverage[0].source].label : "the source set";
  const executiveThesis = total
    ? `This week's signal surface is led by ${topTopic}, with ${topSource} contributing the largest share of reviewed evidence. The pattern to watch is not any single headline, but the convergence of capability, adoption, and risk signals across the ecosystem.`
    : "The weekly signal surface is still forming; keep the review set active and treat early patterns as exploratory rather than predictive.";

  const evidence = report.events.slice(0, 3).map((e) => e.title);
  const recommendations: WeeklyRecommendation[] = [
    {
      type: "opportunity",
      title: `Run a focused ${topTopic} opportunity scan`,
      rationale: `${topTopic} is the strongest recurring topic in this week's reviewed evidence and is appearing across multiple signal types.`,
      nextStep: "Choose one customer workflow, define a one-week prototype, and establish a measurable success threshold before building further.",
      confidence: topicCoverage[0]?.count && topicCoverage[0].count >= 4 ? "high" : "medium",
      evidence,
    },
    {
      type: "risk",
      title: "Re-check the adjacent security and dependency surface",
      rationale: "Fast-moving technology adoption often changes identity, supply-chain, data, and vendor concentration assumptions before controls catch up.",
      nextStep: "Review the threat model, critical vendors, and data flows touched by the most relevant signal this week.",
      confidence: impactCoverage.find((x) => x.dimension === "Information Security")?.count ? "high" : "medium",
      evidence: report.events.filter((e) => e.impacts.includes("Information Security")).slice(0, 3).map((e) => e.title),
    },
    {
      type: "experiment",
      title: "Convert the highest-information signal into a bounded experiment",
      rationale: "A small, time-boxed test is the fastest way to separate an interesting signal from a strategically useful one.",
      nextStep: "Write the falsifiable question, assign an owner, and review the result in seven days with a go/no-go decision.",
      confidence: "medium",
      evidence: report.events.slice(0, 3).map((e) => e.title),
    },
  ];

  return {
    weekStart: start,
    weekEnd: end,
    generatedAt: Date.now(),
    totalSignals: total,
    sourceCount: report.sourcesUsed.length,
    activeTopics: topicCoverage.length,
    events: report.events,
    themes,
    sourceCoverage,
    topicCoverage,
    impactCoverage,
    recommendations,
    executiveThesis,
    carryForward: [
      "Which signal repeated often enough to deserve a named strategic position?",
      "What changed in our assumptions about customer behavior, infrastructure, or risk?",
      "Which experiment would generate the most useful information before next week's review?",
      "What should we stop monitoring because it is noise rather than a decision-relevant signal?",
      "Which emerging capability could become a distribution, cost, or data advantage for us?",
    ],
    methodology: "The weekly view aggregates the current seven-day signal window, deduplicates headlines, weights source activity, groups events by topic and impact, and turns recurring patterns into bounded opportunity, risk, and experiment recommendations. It is a decision-support layer, not a forecast.",
  };
}
