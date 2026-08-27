import type {
  DailyReport,
  ImpactDimension,
  ImpactSection,
  RawEvent,
  ReportEvent,
  SourceBreakdown,
  SourceId,
  Topic,
  TopicSection,
} from "./types";
import { IMPACT_DIMENSIONS, SOURCES, TOPICS } from "./types";

// ---- keyword lexicons for impact classification ----
const LEX: Record<ImpactDimension, string[]> = {
  "Information Security": [
    "breach", "vulnerab", "exploit", "malware", "ransomware", "phishing",
    "zero-day", "0day", "cve", "patch", "backdoor", "leak", "ddos",
    "hack", "cyber", "security", "auth", "encryption", "password", "token",
    "mitm", "supply chain", "data leak", "exfiltrat", "botnet", "trojan",
    "worm", "spyware", "firewall", "ids", "siem", "soc", "threat",
    "incident", "compliance", "gdpr", "sox", "hipaa", "pci",
  ],
  Technology: [
    "ai", "ml", "llm", "gpt", "model", "gpu", "cloud", "aws", "azure",
    "gcp", "kubernetes", "docker", "serverless", "saas", "api", "framework",
    "rust", "python", "typescript", "javascript", "react", "database",
    "performance", "compiler", "runtime", "linux", "windows", "macos",
    "ios", "android", "chrome", "browser", "open source", "chip", "semiconductor",
    "nvidia", "amd", "intel", "arm", "risc-v", "quantum", "web3", "blockchain",
  ],
  Innovation: [
    "launch", "startup", "funding", "raises", "series a", "series b",
    "acqui", "ipo", "spac", "patent", "research", "breakthrough",
    "demo", "introduces", "announces", "unveil", "open source", "paper",
    "discovery", "prototype", "y combinator", "yig", "new product",
    "first ever", "world's first", "milestone", "stem cell", "fusion",
    "crispr", "biotech", "robot", "autonomous", "ev", "battery",
  ],
  "Lifestyle & Hacks": [
    "productivity", "workflow", "tip", "trick", "hack", "diy", "life hack",
    "habit", "wellness", "mental health", "sleep", "fitness", "diet",
    "remote work", "freelance", "side project", "side hustle", "travel",
    "social media", "tiktok", "instagram", "youtube", "creator", "monetiz",
    "minimal", "frugal", "automation", "shortcut", "tool", "gadget",
  ],
};

// ---- keyword lexicons for focused topic tagging ----
const TOPIC_LEX: Record<Topic, string[]> = {
  "Artificial Intelligence": [
    "ai", " ml ", "machine learning", "llm", "gpt", "deep learning",
    "neural", "transformer", "diffusion", " agentic", "agent", "rag",
    "inference", "fine-tun", "embedding", "openai", "anthropic",
    "mistral", "llama", "gemini", "copilot", "chatbot", "foundation model",
  ],
  Robotics: [
    "robot", "actuator", "manipulator", "autonomous", "drone", "uav",
    "slam", "lidar", "locomotion", "humanoid", "bipedal", "cobot",
    "rover", "embodiment", "reinforcement", "sim-to-real", "moravec",
  ],
  "Open Source": [
    "open source", "github", "fork", "mit license", "apache license",
    "gpl", "repo", "maintainer", "contributor", " oss ", " oss,",
    "copilot", "self-host", "permissive license",
  ],
  "Developer Tools": [
    "ide", "linter", "compiler", "debugger", "ci/cd", "pipeline",
    "framework", "sdk", "cli", "terminal", "shell", "editor", "vite",
    "webpack", "esbuild", "turbopack", "language server", "lsp", "devex",
  ],
  Cybersecurity: [
    "breach", "vulnerab", "exploit", "cve", "malware", "ransomware",
    "phishing", "zero-day", "pen test", "red team", "blue team",
    "siem", "soc", "threat", "incident", "backdoor", "botnet",
  ],
  "Hardware & Chips": [
    "chip", "semiconductor", "nvidia", "amd", "intel", "arm", "risc-v",
    "gpu", "tpu", "silicon", "fab", "tsmc", "asml", "motherboard",
    "embedded", "fpga", "asic", "pcb", "iou",
  ],
  "Startups & Funding": [
    "startup", "funding", "raises", "series a", "series b", "series c",
    "acqui", "ipo", "spac", " y combinator", "yc ", "seed round",
    "valuation", "venture", "unicorn", "launch hn",
  ],
  Research: [
    "research", "paper", "arxiv", "study", "breakthrough", "discovery",
    "experiment", "nature ", "science", "physics", "biology", "neuroscience",
    "peer-review", "preprint", " doi ",
  ],
  "Consumer Tech": [
    "iphone", "android", "gadget", "wearable", "smartwatch", "earbuds",
    "ev", "electric vehicle", "tesla", "gaming", "console", "streaming",
    "social media", "tiktok", "instagram", "youtube", "creator", "app store",
  ],
  "Climate Tech": [
    "carbon", "climate", "solar", "wind", "renewable", "battery storage",
    "grid", "ev battery", "net zero", "decarbon", "geothermal", "hydrogen",
    "mrv", "carbon capture", "esg", "green tech",
  ],
  "Biotech & Health": [
    "biotech", "genomics", "crispr", "drug discovery", "fda",
    "clinical trial", "pharma", "digital health", "wearable health",
    "diagnostic", "imaging", "sequencing", "mrna", "protein",
    "bioinformatic",
  ],
  "Web3 & Crypto": [
    "blockchain", "crypto", "web3", "defi", "nft", "ethereum", "bitcoin",
    "solana", "stablecoin", "dao", "smart contract", "token", "layer 2",
    "layer 1", "wallet", "on-chain", "staking",
  ],
  "Space Tech": [
    "spacex", "starlink", "rocket", "satellite", "orbit", "nasa",
    "space launch", "reusable", "mars", "moon", "lunar", "constellation",
    "earth observation", "space station", "isru",
  ],
  "Quantum Computing": [
    "quantum", "qubit", "quantum computing", "quantum supremacy",
    "quantum error correction", "post-quantum", "qiskit", "entangle",
    "superposition", "quantum anneal", "photonics",
  ],
  EdTech: [
    "edtech", "learning platform", "tutor", "course", "mooc",
    "k-12", "curriculum", "upskill", "credential", "assessment",
    "classroom", "coursera", "udemy", "duolingo", "proctor",
  ],
};

const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "for", "to", "of", "in", "on",
  "at", "by", "with", "is", "are", "was", "were", "be", "been", "being",
  "this", "that", "these", "those", "it", "its", "as", "from", "your",
  "you", "we", "they", "he", "she", "i", "not", "no", "so", "if", "than",
  "then", "will", "can", "could", "should", "would", "may", "might",
  "has", "have", "had", "do", "does", "did", "new", "how", "what", "why",
  "who", "where", "when", "which", "via", "after", "before", "into",
  "over", "up", "down", "out", "about", "more", "most", "some", "any",
]);

function classify(title: string): { impacts: ImpactDimension[]; signals: string[] } {
  const t = title.toLowerCase();
  const impacts: ImpactDimension[] = [];
  const signals: string[] = [];
  for (const dim of IMPACT_DIMENSIONS) {
    for (const kw of LEX[dim]) {
      if (t.includes(kw)) {
        if (!impacts.includes(dim)) impacts.push(dim);
        if (!signals.includes(kw)) signals.push(kw);
      }
    }
  }
  // Source-driven defaults so events still get categorized.
  if (impacts.length === 0) {
    impacts.push("Technology");
    signals.push("technology");
  }
  return { impacts, signals };
}

function classifyTopics(
  title: string,
  source: SourceId,
  tags?: string[]
): Topic[] {
  const t = ` ${title.toLowerCase()} `;
  const topics: Topic[] = [];
  for (const topic of TOPICS) {
    for (const kw of TOPIC_LEX[topic]) {
      if (t.includes(kw)) {
        if (!topics.includes(topic)) topics.push(topic);
        break; // one match per topic is enough
      }
    }
  }
  // Source-driven topic inference.
  if (source === "github" && !topics.includes("Open Source"))
    topics.push("Open Source");
  if (source === "arxiv-ai" && !topics.includes("Artificial Intelligence"))
    topics.push("Artificial Intelligence");
  if (
    source === "arxiv-robotics" &&
    !topics.includes("Robotics") &&
    !topics.includes("Research")
  )
    topics.push("Robotics");
  if (source.startsWith("arxiv") && !topics.includes("Research"))
    topics.push("Research");
  if (source === "thehackernews" && !topics.includes("Cybersecurity"))
    topics.push("Cybersecurity");
  if (
    (source === "verge" || source === "engadget") &&
    !topics.includes("Consumer Tech")
  )
    topics.push("Consumer Tech");
  // Tag-driven inference.
  if (tags) {
    const joined = tags.join(" ").toLowerCase();
    if (
      joined.includes("ai") &&
      !topics.includes("Artificial Intelligence")
    )
      topics.push("Artificial Intelligence");
    if (
      joined.includes("robotics") &&
      !topics.includes("Robotics")
    )
      topics.push("Robotics");
  }
  if (topics.length === 0) topics.push("Developer Tools");
  return topics;
}

function topThemes(events: RawEvent[]): { theme: string; count: number }[] {
  const freq = new Map<string, number>();
  for (const e of events) {
    const words = e.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w));
    const seen = new Set<string>();
    for (const w of words) {
      if (seen.has(w)) continue;
      seen.add(w);
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .filter((t) => t.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

// Extract a likely "who" from the title: capitalized lead noun phrase.
function extractWho(title: string): string {
  const m = title.match(/^([A-Z][a-zA-Z0-9&.]+(?:\s+[A-Z][a-zA-Z0-9&.]+){0,3})/);
  if (m) return m[1].trim();
  return "Industry participant";
}

function extractWhere(title: string, source: SourceId): string {
  const places = [
    "US", "USA", "UK", "EU", "China", "India", "Japan", "Europe",
    "California", "Texas", "New York", "Berlin", "London", "Paris",
    "Israel", "Singapore", "Canada", "Brazil",
  ];
  for (const p of places) {
    const re = new RegExp(`\\b${p}\\b`);
    if (re.test(title)) return p;
  }
  return SOURCES[source].label + " (digital surface)";
}

// ---- Title- and topic-aware idea brainstormer ----
// Generates richer, more varied prompts by combining topic context with
// title fragments and the impact dimension. Each call produces 3 ideas.
function brainstormIdeas(
  title: string,
  topics: Topic[],
  dim: ImpactDimension
): string[] {
  const first4 = title.split(" ").slice(0, 5).join(" ");
  const primaryTopic = topics[0];
  const out: string[] = [];

  const TOPIC_IDEAS: Record<Topic, (lead: string) => string[]> = {
    "Artificial Intelligence": (lead) => [
      `If ${lead}... becomes a commodity, what proprietary data or workflow moat could you build on top of it?`,
      "Could you build a vertical-specific wrapper (legal, healthcare, finance) around this capability before incumbents do?",
      "What inference-cost or latency advantage would make this viable for real-time product features?",
    ],
    Robotics: (lead) => [
      `If ${lead}... proves out in simulation, what's the fastest path to a real-world pilot in a constrained environment?`,
      "Which dull, dirty, or dangerous task in your operations could this kind of autonomy take over first?",
      "What sensor or data-pipeline investment would you need to make this reliable enough to ship?",
    ],
    "Open Source": (lead) => [
      `Could you fork or extend ${lead}... as the foundation of an internal platform, and what would you contribute back?`,
      "Is there a commercial services or hosted-offering angle (support, security patches, managed deploy) worth pursuing?",
      "What's the governance and bus-factor risk of depending on this project long-term?",
    ],
    "Developer Tools": (lead) => [
      `Would adopting ${lead}... measurably shorten your team's build-test-ship cycle, and how would you measure that?`,
      "Could this tool's paradigm (linting, LSP, bundling) inform a tool you build for your own users?",
      "What's the migration cost vs. the productivity payoff, and is there a hybrid adoption path?",
    ],
    Cybersecurity: (lead) => [
      `Does ${lead}... expose a gap in your current controls, and what's the cheapest compensating measure you could deploy this week?`,
      "Could the technique behind this signal be repurposed as a defensive detection or red-team exercise?",
      "What's the blast radius if this were exploited against your most valuable asset?",
    ],
    "Hardware & Chips": (lead) => [
      `If ${lead}... shifts price/performance, which of your workloads become newly viable (on-device, edge, training)?`,
      "Could a hardware-software co-design approach give you a cost or latency moat competitors can't easily copy?",
      "What supply-chain or geopolitical dependency does this introduce or resolve?",
    ],
    "Startups & Funding": (lead) => [
      `Does ${lead}... signal a market opening where a fast-follower or counter-positioned entrant could win?`,
      "What talent or capability would you need to acquire or hire to compete in this space within 6 months?",
      "Is there a service-layer or picks-and-shovels opportunity around this funded category?",
    ],
    Research: (lead) => [
      `Could the method behind ${lead}... be productized before the research community moves on to the next thing?`,
      "What's the simplest experiment that would tell you if this result generalizes to your domain?",
      "Are there open datasets or benchmarks here you could use to build a defensible evaluation moat?",
    ],
    "Consumer Tech": (lead) => [
      `Does ${lead}... hint at a behavior shift your existing users are about to expect from your product?`,
      "Could this format, form-factor, or interaction pattern inspire a feature your competitors haven't considered?",
      "What's the platform-policy or App-Store risk of building on top of this trend?",
    ],
    "Climate Tech": (lead) => [
      `Could ${lead}... unlock a compliance or reporting capability your customers will soon be required to have?`,
      "Is there a measurement/MRV (monitoring, reporting, verification) angle where your data could add defensible value?",
      "What incentive or subsidy landscape would make this economically viable before the tech is fully mature?",
    ],
    "Biotech & Health": (lead) => [
      `Could the technique behind ${lead}... be repurposed for a non-therapeutic (wellness, performance, ag) application with faster time-to-market?`,
      "What regulatory pathway (FDA, CE, etc.) would you need to navigate, and is there a 510(k)-class shortcut?",
      "Is there a data-advantage (proprietary dataset, patient cohort) you could build that competitors can't easily replicate?",
    ],
    "Web3 & Crypto": (lead) => [
      `Does ${lead}... solve a real coordination, trust, or settlement problem you have, or is it a solution looking for one?`,
      "Could the token-incentive or governance model here be repurposed for a non-crypto community or marketplace?",
      "What's the regulatory exposure (SEC, MiCA) of building on or around this, and is it worth the complexity?",
    ],
    "Space Tech": (lead) => [
      `Could the data or capability from ${lead}... (earth observation, comms, positioning) be productized for a terrestrial use case?`,
      "Is there a downstream analytics or services layer (processing, visualization, alerting) worth building on top of this raw capability?",
      "What's the launch-cost or licensing dependency, and does it make unit economics viable at your scale?",
    ],
    "Quantum Computing": (lead) => [
      `If ${lead}... advances the timeline to quantum advantage, which of your cryptographic or optimization workloads are first to be affected?`,
      "Could you start building quantum-readiness (post-quantum crypto migration, hybrid algorithms) as a service for your customers now?",
      "Is there a simulation or algorithm-design angle where near-term NISQ devices could give you an edge over classical methods?",
    ],
    EdTech: (lead) => [
      `Could ${lead}... inform how you train, onboard, or certify users on your own product or platform?`,
      "Is there a credentialing or skills-verification layer you could build that employers would pay for?",
      "What's the distribution advantage (institutional partnerships, B2B2C) that would make this defensible against consumer-only entrants?",
    ],
  };

  // Topic-driven ideas (primary topic first, then secondary if room).
  if (primaryTopic) {
    out.push(...TOPIC_IDEAS[primaryTopic](first4).slice(0, 2));
  }
  // Dimension-driven fallback so every event gets a third, varied idea.
  const DIM_IDEA: Record<ImpactDimension, string> = {
    "Information Security":
      "If you assumed this would be exploited within 30 days, what would you do differently today?",
    Technology:
      "What would it take to run a one-week spike to validate or de-risk this for your stack?",
    Innovation:
      "Is there a counter-position or adjacent product idea this capability unlocks that incumbents would avoid?",
    "Lifestyle & Hacks":
      "Could this behavior shift open a new customer segment or use case for what you already build?",
  };
  out.push(DIM_IDEA[dim]);

  return out.slice(0, 3);
}

function watchForTopics(topics: Topic[]): string[] {
  const TOPIC_WATCH: Record<Topic, string[]> = {
    "Artificial Intelligence": [
      "Track model-release velocity and benchmark scores as a commoditization signal.",
      "Watch for inference-cost drops that unlock new real-time product features.",
    ],
    Robotics: [
      "Follow sim-to-real transfer benchmarks and hardware cost curves.",
      "Watch for regulatory frameworks around autonomous systems in public spaces.",
    ],
    "Open Source": [
      "Monitor star/fork velocity and maintainer health as adoption and bus-factor signals.",
      "Watch for license changes or commercialization moves by the project's sponsor.",
    ],
    "Developer Tools": [
      "Track ecosystem/plugin adoption as evidence of stickiness.",
      "Watch for the tool being absorbed into a platform's native offering.",
    ],
    Cybersecurity: [
      "Watch for follow-on patches, CVE assignments, and proof-of-concept exploit code.",
      "Monitor threat-intel feeds for active exploitation in the wild.",
    ],
    "Hardware & Chips": [
      "Track price/performance benchmarks and availability lead times.",
      "Watch for export-control or geopolitical supply-chain shifts.",
    ],
    "Startups & Funding": [
      "Follow subsequent funding rounds and hiring velocity as a leading indicator.",
      "Watch for incumbent response (copy, acquire, or compete).",
    ],
    Research: [
      "Monitor citation count and follow-up papers as a reproducibility and impact signal.",
      "Watch for the technique being adopted by a product team or startup.",
    ],
    "Consumer Tech": [
      "Track engagement and usage trends as evidence of consumer stickiness.",
      "Watch for platform-policy or regulatory reaction to the trend.",
    ],
    "Climate Tech": [
      "Track policy and subsidy changes (IRA, EU Green Deal) as market-creation signals.",
      "Watch for MRV standards consolidating around a common methodology.",
    ],
    "Biotech & Health": [
      "Follow clinical-trial milestones and FDA/EMA regulatory decisions.",
      "Watch for reimbursement-code and payer-coverage signals as adoption proof.",
    ],
    "Web3 & Crypto": [
      "Monitor on-chain metrics (TVL, active addresses) as organic-adoption proof.",
      "Watch for regulatory enforcement actions (SEC, MiCA) as market-structure signals.",
    ],
    "Space Tech": [
      "Track launch cadence and cost-per-kg as the leading infrastructure signal.",
      "Watch for regulatory spectrum and orbital-slot allocation decisions.",
    ],
    "Quantum Computing": [
      "Monitor qubit-count and error-correction milestones as the progress benchmark.",
      "Watch for NIST post-quantum cryptography standardization and migration deadlines.",
    ],
    EdTech: [
      "Track institutional adoption and district/state procurement as scale signals.",
      "Watch for accreditation and credit-transfer recognition as validity signals.",
    ],
  };
  const out: string[] = [];
  for (const t of topics.slice(0, 2)) {
    out.push(...TOPIC_WATCH[t].slice(0, 1));
  }
  return out.slice(0, 2);
}

export function synthesizeReport(
  raw: RawEvent[],
  sourcesUsed: SourceId[],
  sourcesFailed: SourceId[]
): DailyReport {
  // Dedupe by normalized title across sources (keep highest-score).
  const byTitle = new Map<string, RawEvent>();
  for (const e of raw) {
    const key = e.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const prev = byTitle.get(key);
    if (!prev || (e.score ?? 0) > (prev.score ?? 0)) {
      byTitle.set(key, e);
    }
  }
  const deduped = [...byTitle.values()];

  // Rank by score (fallback to recency).
  deduped.sort((a, b) => {
    const sa = a.score ?? 0;
    const sb = b.score ?? 0;
    if (sb !== sa) return sb - sa;
    return (b.publishedAt ?? 0) - (a.publishedAt ?? 0);
  });

  const top = deduped.slice(0, 30);

  const events: ReportEvent[] = top.map((e, i) => {
    const { impacts, signals } = classify(e.title);
    const topics = classifyTopics(e.title, e.source, e.tags);
    const when = new Date(e.publishedAt || Date.now());
    const who = extractWho(e.title);
    const where = extractWhere(e.title, e.source);
    const primary = impacts[0];
    return {
      id: `${e.source}-${i}`,
      source: e.source,
      title: e.title,
      url: e.url,
      publishedAt: e.publishedAt || Date.now(),
      score: e.score,
      who,
      what: e.title,
      when: when.toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      where,
      why: `${signals.slice(0, 3).join(", ")} signal(s) detected from ${SOURCES[e.source].label}.`,
      how: e.url ? `Reported via ${SOURCES[e.source].label}; see source for methodology.` : "Aggregated from public feed.",
      summary: e.summary ?? e.title,
      impacts,
      signals,
      topics,
      ideasWorthExploring: brainstormIdeas(e.title, topics, primary),
      whatToWatch: watchForTopics(topics),
    };
  });

  const byImpact: ImpactSection[] = IMPACT_DIMENSIONS.map((dimension) => ({
    dimension,
    events: events.filter((e) => e.impacts.includes(dimension)),
  })).filter((s) => s.events.length > 0);

  const byTopic: TopicSection[] = TOPICS.map((topic) => ({
    topic,
    events: events.filter((e) => e.topics.includes(topic)),
  })).filter((s) => s.events.length > 0);

  const bySource: SourceBreakdown[] = sourcesUsed
    .map((s) => ({ source: s, count: events.filter((e) => e.source === s).length }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const themes = topThemes(raw);

  const leadThemes = themes.slice(0, 3).map((t) => t.theme).join(", ");
  const topicNames = byTopic.map((t) => t.topic).join(", ");
  const executiveSummary =
    `Today's briefing synthesizes ${events.length} signals across ${sourcesUsed.length} live source(s) ` +
    `(${sourcesUsed.map((s) => SOURCES[s].label).join(", ")}). ` +
    `Dominant themes: ${leadThemes || "broad-spectrum tech and security activity"}. ` +
    `Focus topics in scope: ${topicNames || "general technology"}. ` +
    `Information Security, Technology, Innovation, and Lifestyle vectors are each represented below ` +
    `with a 5W1H breakdown, topic tagging, and forward-looking questions. ` +
    (sourcesFailed.length
      ? `Note: ${sourcesFailed.map((s) => SOURCES[s].label).join(", ")} were unavailable at generation time.`
      : "All configured sources responded successfully.");

  const keyQuestions = [
    "Which of today's signals could become a material risk or opportunity within 90 days?",
    "Are there clusters (same theme across multiple sources) that warrant deeper investigation?",
    "What baseline metric would let us detect the impact of these signals on our roadmap?",
    "Which signals map to our existing threat model or competitive landscape?",
    "Which AI or robotics signal here, if productized first, would create a defensible moat?",
    "What open-source project trending today should we evaluate, contribute to, or build a service layer around?",
    "If we had to pick one signal to run a one-week spike on, which would have the highest information value?",
    "Which signals indicate a behavior or infra shift our customers will expect from us within 6 months?",
  ];

  return {
    date: new Date().toISOString().slice(0, 10),
    generatedAt: Date.now(),
    totalEvents: events.length,
    events,
    byImpact,
    byTopic,
    bySource,
    topThemes: themes,
    executiveSummary,
    keyQuestions,
    sourcesUsed,
    sourcesFailed,
  };
}
