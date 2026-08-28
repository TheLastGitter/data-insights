import type { ContentBasis, DailyReport, ReportEvent, SourceId } from "./types";

export type { ContentBasis };

/**
 * What this app may produce without a publisher license.
 * Titles, URLs, dates, and short feed teasers are aggregator-normal.
 * Full article HTML, `content:encoded`, and ArXiv abstracts are not.
 * Thumbnails are allowed only when the publisher put them in the feed or a public API.
 */
export const MAX_EXCERPT_CHARS = 280;
export const UNLICENSED_SURFACE = {
  licensedFullText: false,
  storesArticleHtml: false,
  usesContentEncoded: false,
  usesFeedThumbnails: true,
  scrapesArticleImages: false,
  maxExcerptChars: MAX_EXCERPT_CHARS,
  notice:
    "No licensed republication. Cards show the publisher headline, a feed thumbnail when the source provided one, an optional short teaser, and a link to the original.",
} as const;

/** ArXiv RSS description is usually the full abstract — skip it without a license. */
const TITLE_ONLY_SOURCES = new Set<SourceId>(["arxiv-ai", "arxiv-robotics"]);

export function feedText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object" && "#text" in value) {
    return String((value as { "#text"?: unknown })["#text"] ?? "");
  }
  return "";
}

function stripHtml(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function capExcerpt(text: string): string | undefined {
  const clean = stripHtml(text);
  if (clean.length < 40) return undefined;
  if (clean.length <= MAX_EXCERPT_CHARS) return clean;
  const cut = clean.slice(0, MAX_EXCERPT_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim();
  return `${trimmed}…`;
}

/**
 * Teaser from RSS/Atom item. Never reads `content:encoded` or Atom `content`
 * (those fields are often the full article).
 */
export function excerptFromFeedItem(
  source: SourceId,
  item: Record<string, unknown>,
): string | undefined {
  if (TITLE_ONLY_SOURCES.has(source)) return undefined;
  const raw = feedText(item.description) || feedText(item.summary);
  if (!raw) return undefined;
  return capExcerpt(raw);
}

export function contentBasisFor(
  source: SourceId,
  excerpt: string | undefined,
  kind: "feed" | "api" | "title",
): ContentBasis {
  if (TITLE_ONLY_SOURCES.has(source) || kind === "title" || !excerpt) {
    return "title-only";
  }
  if (kind === "api") return "api-metadata";
  return "rss-excerpt";
}

export function formatOurDek(input: {
  sourceLabel: string;
  topics: string[];
  signals: string[];
  basis: ContentBasis;
}): string {
  const topic = input.topics[0] ?? "Technology";
  const sig = input.signals.slice(0, 2).join(", ");
  const basisNote =
    input.basis === "rss-excerpt"
      ? "Feed teaser only; not the article."
      : input.basis === "api-metadata"
        ? "Public API metadata; not an article body."
        : "Headline only; not an article body.";
  return `Our take: ${topic}${sig ? ` — ${sig}` : ""}. From ${input.sourceLabel}. ${basisNote}`;
}

export function assertNoFullText(report: DailyReport): void {
  for (const event of report.events) {
    if ((event.excerpt?.length ?? 0) > MAX_EXCERPT_CHARS + 1) {
      throw new Error(`excerpt over cap for ${event.id}`);
    }
  }
}

export function portalCard(event: ReportEvent) {
  return {
    id: event.id,
    source: event.source,
    title: event.title,
    url: event.url,
    publishedAt: event.publishedAt,
    dek: event.summary,
    excerpt: event.excerpt ?? null,
    imageUrl: event.imageUrl ?? null,
    contentBasis: event.contentBasis,
    topics: event.topics,
    impacts: event.impacts,
    score: event.score ?? null,
  };
}
