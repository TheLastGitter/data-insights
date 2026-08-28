import {
  capExcerpt,
  contentBasisFor,
} from "./rights";
import {
  atomEntries,
  mapAtomEntry,
  mapRssItem,
  rssChannelItems,
} from "./feedParse";
import { githubOpenGraphImage, redditPreviewImage } from "./feedImage";
import type { RawEvent, SourceId } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) data-insights-scout/1.0";

async function fetchText(url: string, timeoutMs = 8000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json,text/xml,*/*" },
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

type FetchResult = { events: RawEvent[]; ok: true } | { ok: false };

async function tryFetch(fn: () => Promise<RawEvent[]>): Promise<FetchResult> {
  try {
    const events = await fn();
    return { events, ok: true };
  } catch {
    return { ok: false };
  }
}

async function fetchRss(
  url: string,
  source: SourceId,
  tags: string[],
  limit: number,
): Promise<RawEvent[]> {
  const xml = await fetchText(url);
  return rssChannelItems(xml)
    .slice(0, limit)
    .map((item) => mapRssItem(source, item, tags))
    .filter((event) => event.title && event.url);
}

async function fetchAtom(
  url: string,
  source: SourceId,
  tags: string[],
  limit: number,
): Promise<RawEvent[]> {
  const xml = await fetchText(url);
  return atomEntries(xml)
    .slice(0, limit)
    .map((entry) => mapAtomEntry(source, entry, tags))
    .filter((event) => event.title && event.url);
}

async function fetchHackerNews(): Promise<RawEvent[]> {
  const idsRes = await fetchText(
    "https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=20&orderBy=%22%24key%22",
  );
  const ids: number[] = JSON.parse(idsRes);
  const top = ids.slice(0, 15);
  const items = await Promise.all(
    top.map((id) =>
      fetchText(`https://hacker-news.firebaseio.com/v0/item/${id}.json`),
    ),
  );
  const events: RawEvent[] = [];
  for (const body of items) {
    try {
      const j = JSON.parse(body);
      if (!j || j.type !== "story" || !j.title) continue;
      events.push({
        source: "hackernews",
        title: j.title,
        url: j.url || `https://news.ycombinator.com/item?id=${j.id}`,
        author: j.by,
        publishedAt: (j.time ?? 0) * 1000,
        score: j.score,
        contentBasis: "title-only",
        tags: [],
      });
    } catch {
      // skip malformed
    }
  }
  return events;
}

async function fetchGitHub(): Promise<RawEvent[]> {
  const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const body = await fetchText(
    `https://api.github.com/search/repositories?q=stars:%3E500+pushed:%3E${since}&sort=stars&order=desc&per_page=15`,
    10000,
  );
  const j = JSON.parse(body);
  const items: Record<string, unknown>[] = j?.items ?? [];
  return items.map((repo) => {
    const name = String(repo.full_name ?? repo.name ?? "");
    const stars = Number(repo.stargazers_count ?? 0);
    const desc = String(repo.description ?? "");
    const lang = String(repo.language ?? "");
    const excerpt = capExcerpt(desc);
    return {
      source: "github" as const,
      title: name,
      url: String(repo.html_url ?? `https://github.com/${name}`),
      author: String((repo.owner as { login?: string } | undefined)?.login ?? ""),
      publishedAt: Date.parse(String(repo.pushed_at ?? "")) || Date.now(),
      score: stars,
      excerpt,
      imageUrl: githubOpenGraphImage(name),
      contentBasis: contentBasisFor("github", excerpt, "api"),
      tags: ["opensource", lang.toLowerCase(), "github"].filter(Boolean),
    } satisfies RawEvent;
  });
}

async function fetchReddit(): Promise<RawEvent[]> {
  const subs = ["technology", "science", "netsec"];
  const out: RawEvent[] = [];
  for (const sub of subs) {
    try {
      const body = await fetchText(
        `https://www.reddit.com/r/${sub}/top.json?limit=6&t=day`,
      );
      if (!body.trimStart().startsWith("{")) continue;
      const j = JSON.parse(body);
      const children = j?.data?.children ?? [];
      for (const c of children) {
        const d = c.data;
        if (!d?.title) continue;
        out.push({
          source: "reddit",
          title: d.title,
          url: d.url,
          author: d.author,
          publishedAt: (d.created_utc ?? 0) * 1000,
          score: d.ups,
          contentBasis: "title-only",
          imageUrl: redditPreviewImage(d),
          tags: ["community", sub],
        });
      }
    } catch {
      // subreddit blocked/failed — skip silently
    }
  }
  return out;
}

const FETCHERS: { id: SourceId; fn: () => Promise<RawEvent[]> }[] = [
  { id: "hackernews", fn: fetchHackerNews },
  { id: "producthunt", fn: () => fetchAtom("https://www.producthunt.com/feed", "producthunt", ["product", "launch"], 15) },
  { id: "techcrunch", fn: () => fetchRss("https://techcrunch.com/feed/", "techcrunch", ["news"], 15) },
  { id: "thehackernews", fn: () => fetchRss("https://feeds.feedburner.com/TheHackersNews", "thehackernews", ["security"], 15) },
  { id: "reddit", fn: fetchReddit },
  { id: "github", fn: fetchGitHub },
  { id: "arxiv-ai", fn: () => fetchRss("https://export.arxiv.org/rss/cs.AI", "arxiv-ai", ["ai", "research"], 12) },
  { id: "arxiv-robotics", fn: () => fetchRss("https://export.arxiv.org/rss/cs.RO", "arxiv-robotics", ["robotics", "research"], 12) },
  { id: "ieee-spectrum", fn: () => fetchRss("https://spectrum.ieee.org/feeds/feed.rss", "ieee-spectrum", ["engineering", "robotics"], 12) },
  { id: "verge", fn: () => fetchAtom("https://www.theverge.com/rss/index.xml", "verge", ["consumer", "tech"], 12) },
  { id: "engadget", fn: () => fetchRss("https://www.engadget.com/rss.xml", "engadget", ["consumer", "gadget"], 12) },
  { id: "canary-media", fn: () => fetchRss("https://www.canarymedia.com/feed", "canary-media", ["climate", "energy"], 10) },
  { id: "carbon-brief", fn: () => fetchRss("https://www.carbonbrief.org/feed", "carbon-brief", ["climate", "carbon"], 10) },
  { id: "stat-news", fn: () => fetchRss("https://www.statnews.com/feed/", "stat-news", ["biotech", "health"], 10) },
  { id: "fiercebiotech", fn: () => fetchRss("https://www.fiercebiotech.com/rss/xml", "fiercebiotech", ["biotech", "pharma"], 10) },
  { id: "defiant", fn: () => fetchRss("https://www.thedefiant.io/feed", "defiant", ["web3", "crypto", "defi"], 10) },
  { id: "spacenews", fn: () => fetchRss("https://spacenews.com/feed/", "spacenews", ["space", "aerospace"], 10) },
];

export interface IngestionResult {
  events: RawEvent[];
  sourcesUsed: SourceId[];
  sourcesFailed: SourceId[];
}

export async function ingestAll(): Promise<IngestionResult> {
  const results = await Promise.all(
    FETCHERS.map(async (f) => {
      const r = await tryFetch(f.fn);
      return { id: f.id, r };
    }),
  );
  const events: RawEvent[] = [];
  const sourcesUsed: SourceId[] = [];
  const sourcesFailed: SourceId[] = [];
  for (const { id, r } of results) {
    if (r.ok && r.events.length > 0) {
      events.push(...r.events);
      sourcesUsed.push(id);
    } else {
      sourcesFailed.push(id);
    }
  }
  return { events, sourcesUsed, sourcesFailed };
}
