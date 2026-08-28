// Core domain types for the Data Insights daily report.

export type ImpactDimension =
  | "Information Security"
  | "Technology"
  | "Innovation"
  | "Lifestyle & Hacks";

export const IMPACT_DIMENSIONS: ImpactDimension[] = [
  "Information Security",
  "Technology",
  "Innovation",
  "Lifestyle & Hacks",
];

// Focused topic tags — finer-grained than impact dimensions.
export type Topic =
  | "Artificial Intelligence"
  | "Robotics"
  | "Open Source"
  | "Developer Tools"
  | "Cybersecurity"
  | "Hardware & Chips"
  | "Startups & Funding"
  | "Research"
  | "Consumer Tech"
  | "Climate Tech"
  | "Biotech & Health"
  | "Web3 & Crypto"
  | "Space Tech"
  | "Quantum Computing"
  | "EdTech";

export const TOPICS: Topic[] = [
  "Artificial Intelligence",
  "Robotics",
  "Open Source",
  "Developer Tools",
  "Cybersecurity",
  "Hardware & Chips",
  "Startups & Funding",
  "Research",
  "Consumer Tech",
  "Climate Tech",
  "Biotech & Health",
  "Web3 & Crypto",
  "Space Tech",
  "Quantum Computing",
  "EdTech",
];

export type SourceId =
  | "hackernews"
  | "producthunt"
  | "techcrunch"
  | "thehackernews"
  | "reddit"
  | "github"
  | "arxiv-ai"
  | "arxiv-robotics"
  | "ieee-spectrum"
  | "verge"
  | "engadget"
  | "canary-media"
  | "carbon-brief"
  | "endpoints"
  | "stat-news"
  | "defiant"
  | "spacenews"
  | "fiercebiotech";

export interface SourceMeta {
  id: SourceId;
  label: string;
  accent: string; // tailwind-ish hex used in charts/badges
}

export const SOURCES: Record<SourceId, SourceMeta> = {
  hackernews: { id: "hackernews", label: "Hacker News", accent: "#ff6600" },
  producthunt: { id: "producthunt", label: "Product Hunt", accent: "#da552f" },
  techcrunch: { id: "techcrunch", label: "TechCrunch", accent: "#0a9648" },
  thehackernews: { id: "thehackernews", label: "The Hacker News", accent: "#b3122d" },
  reddit: { id: "reddit", label: "Reddit", accent: "#ff4500" },
  github: { id: "github", label: "GitHub Trending", accent: "#6e40c9" },
  "arxiv-ai": { id: "arxiv-ai", label: "ArXiv (AI)", accent: "#b31b1b" },
  "arxiv-robotics": { id: "arxiv-robotics", label: "ArXiv (Robotics)", accent: "#8c2f0d" },
  "ieee-spectrum": { id: "ieee-spectrum", label: "IEEE Spectrum", accent: "#00629b" },
  verge: { id: "verge", label: "The Verge", accent: "#5200ff" },
  engadget: { id: "engadget", label: "Engadget", accent: "#0e9ce0" },
  "canary-media": { id: "canary-media", label: "Canary Media", accent: "#0d7c66" },
  "carbon-brief": { id: "carbon-brief", label: "Carbon Brief", accent: "#1a7a4c" },
  endpoints: { id: "endpoints", label: "Endpoints News", accent: "#0052cc" },
  "stat-news": { id: "stat-news", label: "STAT News", accent: "#0080a0" },
  defiant: { id: "defiant", label: "The Defiant", accent: "#9b59b6" },
  spacenews: { id: "spacenews", label: "SpaceNews", accent: "#1a3a5c" },
  fiercebiotech: { id: "fiercebiotech", label: "Fierce Biotech", accent: "#005a7a" },
};

export type ContentBasis = "title-only" | "rss-excerpt" | "api-metadata";

/** Raw, source-native item normalized into a common shape. */
export interface RawEvent {
  source: SourceId;
  title: string;
  url: string;
  author?: string;
  publishedAt: number; // epoch ms
  score?: number; // upvotes / points
  /** Publisher feed teaser only; never article HTML. */
  excerpt?: string;
  /** Thumbnail from the feed or public API, not scraped article HTML. */
  imageUrl?: string;
  contentBasis: ContentBasis;
  tags?: string[];
}

/** Synthesized event with 5W1H fields and impact classification. */
export interface ReportEvent {
  id: string;
  source: SourceId;
  title: string;
  url: string;
  publishedAt: number;
  score?: number;
  who: string;
  what: string;
  when: string;
  where: string;
  why: string;
  how: string;
  /** Our classification dek — not a republished article. */
  summary: string;
  /** Capped publisher feed teaser, if the feed supplied one. */
  excerpt?: string;
  imageUrl?: string;
  contentBasis: ContentBasis;
  impacts: ImpactDimension[];
  signals: string[]; // keywords driving classification
  ideasWorthExploring: string[];
  whatToWatch: string[];
  topics: Topic[];
}

export interface ImpactSection {
  dimension: ImpactDimension;
  events: ReportEvent[];
}

export interface SourceBreakdown {
  source: SourceId;
  count: number;
}

export interface TopicSection {
  topic: Topic;
  events: ReportEvent[];
}

export interface DailyReport {
  date: string; // ISO yyyy-mm-dd
  generatedAt: number;
  totalEvents: number;
  events: ReportEvent[];
  byImpact: ImpactSection[];
  byTopic: TopicSection[];
  bySource: SourceBreakdown[];
  topThemes: { theme: string; count: number }[];
  executiveSummary: string;
  keyQuestions: string[];
  sourcesUsed: SourceId[];
  sourcesFailed: SourceId[];
  /** Present on reports generated after the unlicensed portal contract. */
  rights?: {
    licensedFullText: false;
    storesArticleHtml: false;
    maxExcerptChars: number;
    notice: string;
  };
}
