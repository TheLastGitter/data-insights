import { XMLParser } from "fast-xml-parser";
import {
  contentBasisFor,
  excerptFromFeedItem,
  feedText,
} from "./rights";
import { imageFromFeedItem } from "./feedImage";
import type { RawEvent, SourceId } from "./types";

function parser() {
  return new XMLParser({ ignoreAttributes: false });
}

export function rssChannelItems(xml: string): Record<string, unknown>[] {
  const doc = parser().parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.filter((item) => item && typeof item === "object") as Record<
    string,
    unknown
  >[];
}

export function atomEntries(xml: string): Record<string, unknown>[] {
  const doc = parser().parse(xml);
  const entries = doc?.feed?.entry ?? [];
  const list = Array.isArray(entries) ? entries : [entries];
  return list.filter((item) => item && typeof item === "object") as Record<
    string,
    unknown
  >[];
}

function hrefOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const preferred =
      value.find((node) => {
        if (!node || typeof node !== "object") return false;
        const rel = feedText((node as { rel?: unknown; "@_rel"?: unknown }).rel) ||
          feedText((node as { "@_rel"?: unknown })["@_rel"]);
        return rel === "alternate";
      }) ?? value[0];
    return hrefOf(preferred);
  }
  if (value && typeof value === "object") {
    const rec = value as Record<string, unknown>;
    return (
      feedText(rec.href) ||
      feedText(rec["@_href"]) ||
      feedText(rec["#text"])
    );
  }
  return "";
}

export function atomLink(entry: Record<string, unknown>): string {
  return hrefOf(entry.link);
}

export function mapRssItem(
  source: SourceId,
  item: Record<string, unknown>,
  tags: string[],
): RawEvent {
  const excerpt = excerptFromFeedItem(source, item);
  return {
    source,
    title: feedText(item.title),
    url: hrefOf(item.link),
    author: feedText(item["dc:creator"]) || undefined,
    publishedAt: item.pubDate ? Date.parse(feedText(item.pubDate)) : Date.now(),
    excerpt,
    imageUrl: imageFromFeedItem(item),
    contentBasis: contentBasisFor(source, excerpt, "feed"),
    tags,
  };
}

export function mapAtomEntry(
  source: SourceId,
  entry: Record<string, unknown>,
  tags: string[],
): RawEvent {
  const excerpt = excerptFromFeedItem(source, entry);
  const pub = feedText(entry.published) || feedText(entry.updated);
  return {
    source,
    title: feedText(entry.title),
    url: atomLink(entry),
    publishedAt: pub ? Date.parse(pub) : Date.now(),
    excerpt,
    imageUrl: imageFromFeedItem(entry),
    contentBasis: contentBasisFor(source, excerpt, "feed"),
    tags,
  };
}
