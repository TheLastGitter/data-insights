import { XMLParser } from "fast-xml-parser";
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

// ---------- Hacker News (Firebase JSON, no key) ----------
async function fetchHackerNews(): Promise<RawEvent[]> {
  const idsRes = await fetchText(
    "https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=20&orderBy=%22%24key%22"
  );
  const ids: number[] = JSON.parse(idsRes);
  const top = ids.slice(0, 15);
  const items = await Promise.all(
    top.map((id) =>
      fetchText(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    )
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
        summary: j.title,
        tags: [],
      });
    } catch {
      // skip malformed
    }
  }
  return events;
}

// ---------- Product Hunt (Atom feed) ----------
async function fetchProductHunt(): Promise<RawEvent[]> {
  const xml = await fetchText("https://www.producthunt.com/feed");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const entries = doc?.feed?.entry ?? [];
  const list = Array.isArray(entries) ? entries : [entries];
  return list.slice(0, 15).map((e: Record<string, unknown>) => {
    const title = String(e.title ?? "");
    const link = (e.link as { href?: string } | undefined)?.href ?? "";
    const updated = String(e.updated ?? "");
    return {
      source: "producthunt" as SourceId,
      title,
      url: link,
      publishedAt: updated ? Date.parse(updated) : Date.now(),
      score: 0,
      summary: title,
      tags: ["product", "launch"],
    } satisfies RawEvent;
  });
}

// ---------- TechCrunch (RSS) ----------
async function fetchTechCrunch(): Promise<RawEvent[]> {
  const xml = await fetchText("https://techcrunch.com/feed/");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 15).map((e: Record<string, unknown>) => {
    const title = String(e.title ?? "");
    const link = String(e.link ?? "");
    const pub = String(e.pubDate ?? "");
    const creator = String(e["dc:creator"] ?? "");
    return {
      source: "techcrunch" as SourceId,
      title,
      url: link,
      author: creator,
      publishedAt: pub ? Date.parse(pub) : Date.now(),
      summary: title,
      tags: ["news"],
    } satisfies RawEvent;
  });
}

// ---------- The Hacker News (security RSS) ----------
async function fetchTheHackerNews(): Promise<RawEvent[]> {
  const xml = await fetchText("https://feeds.feedburner.com/TheHackersNews");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 15).map((e: Record<string, unknown>) => {
    const title = String(e.title ?? "");
    const link = String(e.link ?? "");
    const pub = String(e.pubDate ?? "");
    return {
      source: "thehackernews" as SourceId,
      title,
      url: link,
      publishedAt: pub ? Date.parse(pub) : Date.now(),
      summary: title,
      tags: ["security"],
    } satisfies RawEvent;
  });
}

// ---------- GitHub Trending (REST API, no key needed) ----------
async function fetchGitHub(): Promise<RawEvent[]> {
  // Recently pushed, high-star repos as a trending proxy.
  const since = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  const body = await fetchText(
    `https://api.github.com/search/repositories?q=stars:%3E500+pushed:%3E${since}&sort=stars&order=desc&per_page=15`,
    10000
  );
  const j = JSON.parse(body);
  const items: Record<string, unknown>[] = j?.items ?? [];
  return items.map((repo) => {
    const name = String(repo.full_name ?? repo.name ?? "");
    const stars = Number(repo.stargazers_count ?? 0);
    const desc = String(repo.description ?? name);
    const lang = String(repo.language ?? "");
    return {
      source: "github" as SourceId,
      title: `${name} — ${desc}`,
      url: String(repo.html_url ?? `https://github.com/${name}`),
      author: String((repo.owner as { login?: string } | undefined)?.login ?? ""),
      publishedAt: Date.parse(String(repo.pushed_at ?? "")) || Date.now(),
      score: stars,
      summary: desc,
      tags: ["opensource", lang.toLowerCase(), "github"].filter(Boolean),
    } satisfies RawEvent;
  });
}

// ---------- ArXiv RSS (cs.AI and cs.RO) ----------
async function fetchArxiv(
  cat: string,
  source: SourceId,
  tag: string
): Promise<RawEvent[]> {
  const xml = await fetchText(`https://export.arxiv.org/rss/${cat}`, 10000);
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 12).map((e: Record<string, unknown>) => {
    const title = String(e.title ?? "").replace(/^\([^)]*\)\s*/, "");
    const link = String(e.link ?? "");
    const pub = String(e.pubDate ?? "");
    const creator = String(e["dc:creator"] ?? "");
    return {
      source,
      title,
      url: link,
      author: creator,
      publishedAt: pub ? Date.parse(pub) : Date.now(),
      summary: title,
      tags: [tag, "research"],
    } satisfies RawEvent;
  });
}

function fetchArxivAI(): Promise<RawEvent[]> {
  return fetchArxiv("cs.AI", "arxiv-ai", "ai");
}
function fetchArxivRobotics(): Promise<RawEvent[]> {
  return fetchArxiv("cs.RO", "arxiv-robotics", "robotics");
}

// ---------- IEEE Spectrum (RSS) ----------
async function fetchIEEE(): Promise<RawEvent[]> {
  const xml = await fetchText("https://spectrum.ieee.org/feeds/feed.rss");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 12).map((e: Record<string, unknown>) => {
    const title = String(e.title ?? "");
    const link = String(e.link ?? "");
    const pub = String(e.pubDate ?? "");
    return {
      source: "ieee-spectrum" as SourceId,
      title,
      url: link,
      publishedAt: pub ? Date.parse(pub) : Date.now(),
      summary: title,
      tags: ["engineering", "robotics"],
    } satisfies RawEvent;
  });
}

// ---------- The Verge (Atom feed) ----------
async function fetchVerge(): Promise<RawEvent[]> {
  const xml = await fetchText("https://www.theverge.com/rss/index.xml");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const entries = doc?.feed?.entry ?? [];
  const list = Array.isArray(entries) ? entries : [entries];
  return list.slice(0, 12).map((e: Record<string, unknown>) => {
    const title = String(e.title ?? "");
    const link = (e.link as { href?: string } | undefined)?.href ?? "";
    const pub = String(e.published ?? e.updated ?? "");
    return {
      source: "verge" as SourceId,
      title,
      url: link,
      publishedAt: pub ? Date.parse(pub) : Date.now(),
      summary: title,
      tags: ["consumer", "tech"],
    } satisfies RawEvent;
  });
}

// ---------- Engadget (RSS) ----------
async function fetchEngadget(): Promise<RawEvent[]> {
  const xml = await fetchText("https://www.engadget.com/rss.xml");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 12).map((e: Record<string, unknown>) => {
    const title = String(e.title ?? "");
    const link = String(e.link ?? "");
    const pub = String(e.pubDate ?? "");
    return {
      source: "engadget" as SourceId,
      title,
      url: link,
      publishedAt: pub ? Date.parse(pub) : Date.now(),
      summary: title,
      tags: ["consumer", "gadget"],
    } satisfies RawEvent;
  });
}

// ---------- Canary Media (Climate Tech RSS) ----------
async function fetchCanaryMedia(): Promise<RawEvent[]> {
  const xml = await fetchText("https://www.canarymedia.com/feed");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 10).map((e: Record<string, unknown>) => ({
    source: "canary-media" as SourceId,
    title: String(e.title ?? ""),
    url: String(e.link ?? ""),
    publishedAt: e.pubDate ? Date.parse(String(e.pubDate)) : Date.now(),
    summary: String(e.title ?? ""),
    tags: ["climate", "energy"],
  } satisfies RawEvent));
}

// ---------- Carbon Brief (Climate Tech RSS) ----------
async function fetchCarbonBrief(): Promise<RawEvent[]> {
  const xml = await fetchText("https://www.carbonbrief.org/feed");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 10).map((e: Record<string, unknown>) => ({
    source: "carbon-brief" as SourceId,
    title: String(e.title ?? ""),
    url: String(e.link ?? ""),
    publishedAt: e.pubDate ? Date.parse(String(e.pubDate)) : Date.now(),
    summary: String(e.title ?? ""),
    tags: ["climate", "carbon"],
  } satisfies RawEvent));
}

// ---------- STAT News (Biotech & Health RSS) ----------
async function fetchSTATNews(): Promise<RawEvent[]> {
  const xml = await fetchText("https://www.statnews.com/feed/");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 10).map((e: Record<string, unknown>) => ({
    source: "stat-news" as SourceId,
    title: String(e.title ?? ""),
    url: String(e.link ?? ""),
    publishedAt: e.pubDate ? Date.parse(String(e.pubDate)) : Date.now(),
    summary: String(e.title ?? ""),
    tags: ["biotech", "health"],
  } satisfies RawEvent));
}

// ---------- Fierce Biotech (Biotech & Health RSS) ----------
async function fetchFierceBiotech(): Promise<RawEvent[]> {
  const xml = await fetchText("https://www.fiercebiotech.com/rss/xml");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 10).map((e: Record<string, unknown>) => ({
    source: "fiercebiotech" as SourceId,
    title: String(e.title ?? ""),
    url: String(e.link ?? ""),
    publishedAt: e.pubDate ? Date.parse(String(e.pubDate)) : Date.now(),
    summary: String(e.title ?? ""),
    tags: ["biotech", "pharma"],
  } satisfies RawEvent));
}

// ---------- The Defiant (Web3 & Crypto RSS) ----------
async function fetchDefiant(): Promise<RawEvent[]> {
  const xml = await fetchText("https://www.thedefiant.io/feed");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 10).map((e: Record<string, unknown>) => ({
    source: "defiant" as SourceId,
    title: String(e.title ?? ""),
    url: String(e.link ?? ""),
    publishedAt: e.pubDate ? Date.parse(String(e.pubDate)) : Date.now(),
    summary: String(e.title ?? ""),
    tags: ["web3", "crypto", "defi"],
  } satisfies RawEvent));
}

// ---------- SpaceNews (Space Tech RSS) ----------
async function fetchSpaceNews(): Promise<RawEvent[]> {
  const xml = await fetchText("https://spacenews.com/feed/");
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, 10).map((e: Record<string, unknown>) => ({
    source: "spacenews" as SourceId,
    title: String(e.title ?? ""),
    url: String(e.link ?? ""),
    publishedAt: e.pubDate ? Date.parse(String(e.pubDate)) : Date.now(),
    summary: String(e.title ?? ""),
    tags: ["space", "aerospace"],
  } satisfies RawEvent));
}

// ---------- Reddit (JSON, degrades gracefully if blocked) ----------
async function fetchReddit(): Promise<RawEvent[]> {
  const subs = ["technology", "science", "netsec"];
  const out: RawEvent[] = [];
  for (const sub of subs) {
    try {
      const body = await fetchText(
        `https://www.reddit.com/r/${sub}/top.json?limit=6&t=day`
      );
      // Reddit sometimes returns HTML to blocked IPs; bail on non-JSON.
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
          summary: d.title,
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
  { id: "producthunt", fn: fetchProductHunt },
  { id: "techcrunch", fn: fetchTechCrunch },
  { id: "thehackernews", fn: fetchTheHackerNews },
  { id: "reddit", fn: fetchReddit },
  { id: "github", fn: fetchGitHub },
  { id: "arxiv-ai", fn: fetchArxivAI },
  { id: "arxiv-robotics", fn: fetchArxivRobotics },
  { id: "ieee-spectrum", fn: fetchIEEE },
  { id: "verge", fn: fetchVerge },
  { id: "engadget", fn: fetchEngadget },
  { id: "canary-media", fn: fetchCanaryMedia },
  { id: "carbon-brief", fn: fetchCarbonBrief },
  { id: "stat-news", fn: fetchSTATNews },
  { id: "fiercebiotech", fn: fetchFierceBiotech },
  { id: "defiant", fn: fetchDefiant },
  { id: "spacenews", fn: fetchSpaceNews },
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
    })
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
