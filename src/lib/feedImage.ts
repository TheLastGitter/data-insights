import { feedText } from "./rights";
import type { RawEvent } from "./types";

const IMAGE_FILE = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

function urlOf(node: unknown): string {
  if (typeof node === "string") return node.trim();
  if (Array.isArray(node)) return urlOf(node[0]);
  if (node && typeof node === "object") {
    const rec = node as Record<string, unknown>;
    return (
      feedText(rec.url) ||
      feedText(rec["@_url"]) ||
      feedText(rec.href) ||
      feedText(rec["@_href"]) ||
      feedText(rec.src) ||
      feedText(rec["@_src"])
    ).trim();
  }
  return "";
}

function typeOf(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const rec = node as Record<string, unknown>;
  return (feedText(rec.type) || feedText(rec["@_type"]) || feedText(rec.medium) || feedText(rec["@_medium"])).toLowerCase();
}

function isHttpUrl(url: string): boolean {
  return url.startsWith("https://") || url.startsWith("http://");
}

function isLikelyImage(url: string, mime = ""): boolean {
  if (!isHttpUrl(url)) return false;
  const lower = url.toLowerCase();
  if (lower.includes("1x1") || lower.includes("/pixel") || lower.includes("tracker") || lower.includes("doubleclick")) {
    return false;
  }
  if (mime.startsWith("image/") || mime === "image") return true;
  if (IMAGE_FILE.test(url)) return true;
  return (
    lower.includes("wp-content") ||
    lower.includes("/media/") ||
    lower.includes("/images/") ||
    lower.includes("/html/") ||
    lower.includes("cdn.") ||
    lower.includes("img.") ||
    lower.includes("cloudfront") ||
    lower.includes("googleusercontent") ||
    lower.includes("preview.redd.it") ||
    lower.includes("opengraph.githubassets.com") ||
    lower.includes("arxiv.org") ||
    lower.includes("ar5iv")
  );
}

function isDecorative(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("logo") ||
    lower.includes("icon") ||
    lower.includes("sprite") ||
    lower.includes("badge") ||
    lower.includes("orcid") ||
    lower.includes("creativecommons") ||
    lower.includes("/static/browse") ||
    lower.includes("arxiv-logo") ||
    lower.includes("/static/") ||
    lower.includes("funder") ||
    lower.includes("sponsor") ||
    lower.includes("simons-foundation")
  );
}

function collect(node: unknown, into: string[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const child of node) collect(child, into);
    return;
  }
  const url = urlOf(node);
  const mime = typeOf(node);
  if (url && isLikelyImage(url, mime)) into.push(url);
  if (node && typeof node === "object") {
    const rec = node as Record<string, unknown>;
    if (rec["media:thumbnail"]) collect(rec["media:thumbnail"], into);
    if (rec["media:content"]) collect(rec["media:content"], into);
    if (rec.thumbnail) collect(rec.thumbnail, into);
    if (rec.content) collect(rec.content, into);
  }
}

function decodeFeedUrl(url: string): string {
  return url.replace(/&amp;/g, "&").replace(/&#038;/g, "&").trim();
}

function allImgSrcs(html: string): string[] {
  const matches = html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi);
  const out: string[] = [];
  for (const match of matches) {
    const url = decodeFeedUrl(match[1] ?? "");
    if (url) out.push(url);
  }
  return out;
}

function resolveUrl(src: string, base: string): string {
  try {
    return new URL(src, base).href;
  } catch {
    return src;
  }
}

export function extractArxivId(url: string): string | undefined {
  const abs = url.match(
    /arxiv\.org\/(?:abs|pdf|html)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?|[a-z-]+(?:\.[A-Z]{2})?\/[0-9]{7})/i,
  );
  if (!abs?.[1]) return undefined;
  return abs[1].replace(/\.pdf$/i, "").replace(/v\d+$/i, "");
}

async function fetchHtml(url: string, timeoutMs = 5000): Promise<string | undefined> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; data-insights-scout/1.0)",
        Accept: "text/html",
      },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) return undefined;
    return (await res.text()).slice(0, 200_000);
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchArxivFigure(id: string): Promise<string | undefined> {
  const bases = [
    `https://arxiv.org/html/${id}`,
    `https://ar5iv.labs.arxiv.org/html/${id}`,
  ];
  for (const base of bases) {
    const html = await fetchHtml(base, 7000);
    if (!html) continue;
    const figures = allImgSrcs(html)
      .map((src) => resolveUrl(src, `${base}/`))
      .filter((src) => isLikelyImage(src, "image/") && !isDecorative(src));
    if (figures[0]) return figures[0];
  }
  return fetchPageImage(`https://arxiv.org/abs/${id}`);
}

/**
 * Thumbnail the publisher already attached to the feed item.
 * Does not fetch article HTML or read content:encoded.
 */
export function imageFromFeedItem(item: Record<string, unknown>): string | undefined {
  const found: string[] = [];
  collect(item["media:thumbnail"], found);
  collect(item["media:content"], found);
  collect(item["media:group"], found);
  collect(item["itunes:image"], found);
  collect(item.enclosure, found);

  const links = item.link;
  if (Array.isArray(links)) {
    for (const link of links) {
      const rel = feedText((link as { rel?: unknown; "@_rel"?: unknown })?.rel) ||
        feedText((link as { "@_rel"?: unknown })["@_rel"]);
      const type = typeOf(link);
      if (rel === "enclosure" || type.startsWith("image/")) {
        collect(link, found);
      }
    }
  }

  const htmlFields = [
    item.description,
    item.summary,
    item.content,
    item["content:encoded"],
  ];
  for (const field of htmlFields) {
    const html = typeof field === "string" ? field : feedText(field);
    const fromHtml = firstImgInHtml(html);
    if (fromHtml) found.push(fromHtml);
  }

  return found.map(decodeFeedUrl).find((url) => isLikelyImage(url));
}

function firstImgInHtml(html: string): string | undefined {
  return allImgSrcs(html).find((url) => isLikelyImage(url, "image/"));
}

async function fetchPageImage(articleUrl: string): Promise<string | undefined> {
  if (!articleUrl.startsWith("http")) return undefined;
  const html = await fetchHtml(articleUrl, 4500);
  if (!html) return undefined;
  const tagged =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ) ||
    html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    ) ||
    html.match(
      /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    );
  let image = tagged?.[1] ? decodeFeedUrl(tagged[1]) : undefined;
  if (!image) {
    image = allImgSrcs(html)
      .map((src) => resolveUrl(src, articleUrl))
      .find((src) => isLikelyImage(src, "image/") && !isDecorative(src));
  }
  if (!image) return undefined;
  if (image.startsWith("//")) image = `https:${image}`;
  if (isLikelyImage(image, "image/") && !isDecorative(image)) return image;
  return undefined;
}

async function findSmartImage(event: RawEvent): Promise<string | undefined> {
  const arxivId = extractArxivId(event.url);
  if (arxivId || event.source === "arxiv-ai" || event.source === "arxiv-robotics") {
    if (arxivId) {
      const figure = await fetchArxivFigure(arxivId);
      if (figure) return figure;
    }
  }
  return fetchPageImage(event.url);
}

/** Fill gaps: paper figures for ArXiv, otherwise og/twitter/image_src from the source URL. */
export async function hydrateMissingImages(events: RawEvent[]): Promise<void> {
  await Promise.all(
    events.map(async (event) => {
      if (event.imageUrl) return;
      event.imageUrl = await findSmartImage(event);
    }),
  );
}

export function redditPreviewImage(data: Record<string, unknown>): string | undefined {
  const preview = data.preview as
    | { images?: { source?: { url?: string } }[] }
    | undefined;
  const fromPreview = preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&");
  if (fromPreview && isHttpUrl(fromPreview)) return fromPreview;
  const thumb = String(data.thumbnail ?? "");
  if (thumb.startsWith("http")) return thumb;
  return undefined;
}

export function githubOpenGraphImage(fullName: string): string | undefined {
  if (!fullName.includes("/")) return undefined;
  return `https://opengraph.githubassets.com/1/${fullName}`;
}
