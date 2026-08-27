import type { SourceId, Topic } from "./types";

// ---- Source assessment model ----
// Documents every source we review, with coverage, reliability, cadence,
// and access method — shown on the dashboard source registry.

export interface SourceAssessment {
  id: SourceId;
  /** What topics/domains this source tends to cover. */
  coverage: Topic[];
  /** One-line description of what the source is. */
  description: string;
  /** Signal quality, editorial stance, known biases. */
  reliability: {
    type: "community-curated" | "editorial" | "peer-reviewed" | "algorithmic";
    bias: string;
    quality: "high" | "medium" | "variable";
    notes: string;
  };
  /** How often the source publishes new content. */
  cadence: "real-time" | "hourly" | "daily" | "weekly";
  /** How we access it — API, protocol, auth, rate limits, failure mode. */
  access: {
    method: string;
    auth: string;
    rateLimit: string;
    failureMode: string;
  };
}

export const SOURCE_ASSESSMENTS: SourceAssessment[] = [
  {
    id: "hackernews",
    coverage: [
      "Artificial Intelligence",
      "Open Source",
      "Developer Tools",
      "Startups & Funding",
      "Cybersecurity",
    ],
    description:
      "Y Combinator's community-curated link board — the de facto front page of the builder and startup internet.",
    reliability: {
      type: "community-curated",
      bias: "Lean technical, startup-founder, Silicon-Valley-centric. Rewards depth and novelty over sentiment.",
      quality: "high",
      notes:
        "Upvote ranking filters for genuinely interesting work. Comment threads often surface expert critique. Tends to over-index on developer tooling and under-index on non-English markets.",
    },
    cadence: "real-time",
    access: {
      method: "Firebase JSON REST API",
      auth: "None (public)",
      rateLimit: "Unofficial; ~1 req/sec recommended",
      failureMode: "Rate-limit or transient 5xx — gracefully skipped.",
    },
  },
  {
    id: "github",
    coverage: [
      "Open Source",
      "Developer Tools",
      "Artificial Intelligence",
      "Cybersecurity",
    ],
    description:
      "GitHub's Search REST API used as a trending proxy — recently pushed, high-star repositories across all languages.",
    reliability: {
      type: "algorithmic",
      bias: "Reflects developer activity, not user adoption. Star counts are cumulative and gaming-resistant but not immune.",
      quality: "high",
      notes:
        "Stars are a strong proxy for developer mindshare. Does not capture private repos or unstarred-but-active projects. Language distribution is self-declared by repo owners.",
    },
    cadence: "real-time",
    access: {
      method: "GitHub Search REST API (repositories)",
      auth: "None for low-volume reads (60 req/hr unauthenticated)",
      rateLimit: "60 req/hr without token, 5,000 with token",
      failureMode: "Rate limit → gracefully skipped.",
    },
  },
  {
    id: "arxiv-ai",
    coverage: ["Artificial Intelligence", "Research"],
    description:
      "ArXiv cs.AI RSS — preprints in Artificial Intelligence, the primary preprint venue for AI/ML research.",
    reliability: {
      type: "peer-reviewed",
      bias: "Research-frontier; preprints are not yet peer-reviewed. Strong selection bias toward novel methods over applied/production work.",
      quality: "variable",
      notes:
        "High signal for where the frontier is moving, but many results don't generalize. Author self-selection biases toward academic and big-lab research. Use as a leading indicator, not a product roadmap.",
    },
    cadence: "daily",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "Reasonable use; no documented hard limit",
      failureMode: "Feed temporarily empty or slow — gracefully skipped.",
    },
  },
  {
    id: "arxiv-robotics",
    coverage: ["Robotics", "Research"],
    description:
      "ArXiv cs.RO RSS — preprints in Robotics, covering control, perception, manipulation, and embodied AI.",
    reliability: {
      type: "peer-reviewed",
      bias: "Academic frontier; simulation-heavy results may not transfer to real hardware. Tends toward method papers over systems papers.",
      quality: "variable",
      notes:
        "Excellent for spotting emerging techniques (sim-to-real, new actuators, locomotion). Real-world deployment claims should be treated skeptically — many results are lab-only.",
    },
    cadence: "daily",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "Reasonable use; no documented hard limit",
      failureMode: "Feed temporarily empty or slow — gracefully skipped.",
    },
  },
  {
    id: "ieee-spectrum",
    coverage: [
      "Robotics",
      "Hardware & Chips",
      "Research",
      "Artificial Intelligence",
    ],
    description:
      "IEEE Spectrum — the flagship magazine of the IEEE, covering engineering, technology, and applied research.",
    reliability: {
      type: "editorial",
      bias: "Professional-engineer audience; technically rigorous, slightly conservative. Favors established research and industry milestones over hype.",
      quality: "high",
      notes:
        "Strong on hardware, semiconductors, and robotics. Less coverage of software-only and consumer trends. Editorial standards are high — content is curated and fact-checked.",
    },
    cadence: "daily",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed structure changes or 5xx — gracefully skipped.",
    },
  },
  {
    id: "producthunt",
    coverage: [
      "Startups & Funding",
      "Consumer Tech",
      "Developer Tools",
      "Artificial Intelligence",
    ],
    description:
      "Product Hunt — daily curation of new products and launches, with a strong startup and builder community.",
    reliability: {
      type: "community-curated",
      bias: "Early-stage startup and indie-hacker centered. Products are submitted by makers, so coverage skews toward self-promoted launches.",
      quality: "medium",
      notes:
        "Good for spotting new product patterns and emerging categories (especially AI tools). Voting can be gamed by coordinated launches. Not representative of enterprise or non-startup product activity.",
    },
    cadence: "daily",
    access: {
      method: "Atom feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "techcrunch",
    coverage: [
      "Startups & Funding",
      "Artificial Intelligence",
      "Consumer Tech",
      "Hardware & Chips",
    ],
    description:
      "TechCrunch — leading technology news outlet focused on startups, funding rounds, and product launches.",
    reliability: {
      type: "editorial",
      bias: "Venture-capital and startup-centric. Tends to amplify funding narratives. Sensational headlines; verify claims independently.",
      quality: "medium",
      notes:
        "Strong for funding and M&A signal. Breaking news is often accurate but shallow. Opinion pieces and sponsored content are not always clearly separated.",
    },
    cadence: "hourly",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "thehackernews",
    coverage: ["Cybersecurity", "Research"],
    description:
      "The Hacker News — cybersecurity news outlet covering breaches, vulnerabilities, malware, and threat intelligence.",
    reliability: {
      type: "editorial",
      bias: "Security-practitioner and vendor-influenced. Prioritizes headline-worthy threats. Some sponsored content from security vendors.",
      quality: "high",
      notes:
        "Reliable for CVE and breach reporting. Good coverage of active exploitation. Vendor-neutral in reporting but ad-adjacent in presentation.",
    },
    cadence: "hourly",
    access: {
      method: "RSS 2.0 feed (Feedburner)",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feedburner outage or 5xx — gracefully skipped.",
    },
  },
  {
    id: "reddit",
    coverage: [
      "Consumer Tech",
      "Artificial Intelligence",
      "Cybersecurity",
      "Developer Tools",
    ],
    description:
      "Reddit — community-sourced discussion from r/technology, r/science, r/netsec. Degrades gracefully when IP-blocked.",
    reliability: {
      type: "community-curated",
      bias: "Subreddit-dependent. r/technology leans populist-consumer; r/netsec is practitioner-grade; r/science is link-to-journal. Hivemind dynamics can amplify or suppress stories non-transparently.",
      quality: "variable",
      notes:
        "Variable by subreddit. High engagement ≠ high quality. Reddit's JSON API soft-blocks datacenter IPs, so this source frequently degrades — treated as best-effort.",
    },
    cadence: "real-time",
    access: {
      method: "JSON API (per-subreddit top/day)",
      auth: "None (public, but IP-sensitive)",
      rateLimit: "Undocumented; datacenter IPs are soft-blocked",
      failureMode: "IP block returns HTML instead of JSON — detected and skipped.",
    },
  },
  {
    id: "verge",
    coverage: ["Consumer Tech", "Artificial Intelligence", "Hardware & Chips"],
    description:
      "The Verge — consumer technology and culture publication covering products, platforms, and the companies behind them.",
    reliability: {
      type: "editorial",
      bias: "Consumer-first perspective. Strong on product launches, platform policy, and big-tech strategy. Less depth on developer/infra topics.",
      quality: "high",
      notes:
        "High editorial standards and original reporting. Reviews are thorough. Coverage skews toward consumer impact over technical depth.",
    },
    cadence: "hourly",
    access: {
      method: "Atom feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "engadget",
    coverage: ["Consumer Tech", "Hardware & Chips", "Artificial Intelligence"],
    description:
      "Engadget — consumer technology news and reviews covering gadgets, gaming, and industry product launches.",
    reliability: {
      type: "editorial",
      bias: "Consumer-electronics and gadget-first. Less analytical than The Verge; more product-cycle driven.",
      quality: "medium",
      notes:
        "Reliable for product-launch timing and specs. Less depth on the implications. Good for catching consumer hardware signals that technical sources miss.",
    },
    cadence: "hourly",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "canary-media",
    coverage: ["Climate Tech"],
    description:
      "Canary Media — specialized climate-tech journalism covering the energy transition, clean tech, and decarbonization.",
    reliability: {
      type: "editorial",
      bias: "Climate-solutions advocate perspective. Pro-renewable, pro-transition; critical of greenwashing. Corporate-backed but editorially independent.",
      quality: "high",
      notes:
        "Excellent for climate-tech market signals, policy analysis, and project-finance tracking. Deep expertise — reporters have industry backgrounds. Does not cover climate denial or skeptic framing.",
    },
    cadence: "daily",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "carbon-brief",
    coverage: ["Climate Tech", "Research"],
    description:
      "Carbon Brief — data-driven climate science and policy analysis, with deep-dive explainers and research summaries.",
    reliability: {
      type: "editorial",
      bias: "Science-based, pro-climate-action. Rigorous and peer-review-literate; favors evidence over narrative.",
      quality: "high",
      notes:
        "Outstanding for research-level climate signals, carbon budgets, and attribution studies. More analytical and slower than news feeds. UK-centric in policy coverage.",
    },
    cadence: "daily",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "stat-news",
    coverage: ["Biotech & Health"],
    description:
      "STAT News — specialized health-tech and biotech journalism covering pharma, medtech, and health-policy.",
    reliability: {
      type: "editorial",
      bias: "Healthcare-industry and patient-centric. Critical of pharma where warranted; pro-science and pro-innovation.",
      quality: "high",
      notes:
        "Top-tier biotech journalism. Strong on clinical-trial analysis, FDA decisions, and health-tech business dynamics. Does not cover basic research as deeply as ArXiv.",
    },
    cadence: "hourly",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "fiercebiotech",
    coverage: ["Biotech & Health", "Startups & Funding"],
    description:
      "Fierce Biotech — biotech industry news covering drug development, clinical trials, deals, and biotech startups.",
    reliability: {
      type: "editorial",
      bias: "Biotech-industry-trade perspective. Pro-innovation, pro-pharma; focused on business outcomes over patient advocacy.",
      quality: "medium",
      notes:
        "Strong for deal-flow, clinical-trial milestones, and biotech-company tracking. Heavy on press-release-driven content. Good complement to STAT for breadth.",
    },
    cadence: "hourly",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "defiant",
    coverage: ["Web3 & Crypto"],
    description:
      "The Defiant — DeFi and Web3 journalism covering protocols, stablecoins, governance, and on-chain analytics.",
    reliability: {
      type: "editorial",
      bias: "DeFi-native and crypto-literate. Pro-decentralization; critical of TradFi where relevant. Less speculative-hype, more protocol-level.",
      quality: "medium",
      notes:
        "Good for DeFi protocol analysis and on-chain signals. Less coverage of BTC price-action or NFT speculation. Coverage depth varies by author.",
    },
    cadence: "daily",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
  {
    id: "spacenews",
    coverage: ["Space Tech"],
    description:
      "SpaceNews — the leading trade publication for the global space industry, covering launches, satellites, policy, and contracts.",
    reliability: {
      type: "editorial",
      bias: "Space-industry trade perspective. Pro-commercial-space; thorough on policy and procurement. DC-centric in regulatory coverage.",
      quality: "high",
      notes:
        "The definitive source for space-industry business signals — contracts, launches, regulatory. Strong on government (NASA, DoD, FAA) and commercial (SpaceX, Blue Origin) equally. Less technical depth on engineering.",
    },
    cadence: "daily",
    access: {
      method: "RSS 2.0 feed",
      auth: "None (public)",
      rateLimit: "None documented",
      failureMode: "Feed unavailable — gracefully skipped.",
    },
  },
];

// ---- Extended topic taxonomy with sub-themes ----
// Every topic now has sub-themes for finer-grained analysis.

export interface SubTheme {
  topic: Topic;
  subThemes: string[];
  description: string;
}

export const TOPIC_TAXONOMY: SubTheme[] = [
  {
    topic: "Artificial Intelligence",
    description:
      "Machine learning, large language models, agents, and AI productization — the frontier and its commercial applications.",
    subThemes: [
      "LLMs & Foundation Models",
      "AI Agents & Tooling",
      "Computer Vision",
      "Speech & NLP",
      "AI Infrastructure (GPU/TPU)",
      "AI Safety & Alignment",
    ],
  },
  {
    topic: "Robotics",
    description:
      "Autonomous systems, manipulation, locomotion, and the hardware-software stack that makes robots work in the real world.",
    subThemes: [
      "Humanoids & Bipedal",
      "Manipulation & Grasping",
      "Drones & Autonomous Vehicles",
      "Sim-to-Real Transfer",
      "Sensors & Perception",
      "Industrial Robotics",
    ],
  },
  {
    topic: "Open Source",
    description:
      "Community-maintained projects, licenses, governance, and the picks-and-shovels of the modern software stack.",
    subThemes: [
      "Dev Frameworks & Libraries",
      "Infrastructure & Cloud-Native",
      "AI Open Weights & Models",
      "Linux & OS-Level",
      "Open Data & Datasets",
      "Maintainer Sustainability",
    ],
  },
  {
    topic: "Developer Tools",
    description:
      "IDEs, compilers, CI/CD, language servers, and everything that shortens the build-test-ship loop.",
    subThemes: [
      "IDEs & Editors",
      "Build Systems & Bundlers",
      "Testing & Observability",
      "CI/CD & Pipelines",
      "Language Servers & LSP",
      "AI-Powered DevEx",
    ],
  },
  {
    topic: "Cybersecurity",
    description:
      "Threats, vulnerabilities, breaches, defensive tooling, and the compliance landscape that shapes risk posture.",
    subThemes: [
      "Vulnerabilities & CVEs",
      "Threat Intelligence",
      "Identity & Access",
      "Cloud Security",
      "Supply-Chain Security",
      "Compliance & Privacy",
    ],
  },
  {
    topic: "Hardware & Chips",
    description:
      "Semiconductors, GPUs, silicon fabrication, and the geopolitics of the hardware supply chain.",
    subThemes: [
      "GPUs & AI Accelerators",
      "Silicon Fabrication & Foundries",
      "RISC-V & Open Hardware",
      "Edge & Embedded",
      "Supply Chain & Geopolitics",
      "Consumer Hardware",
    ],
  },
  {
    topic: "Startups & Funding",
    description:
      "Funding rounds, launches, M&A, and the venture landscape that signals where capital is flowing.",
    subThemes: [
      "Seed & Early-Stage",
      "Series A–C Growth",
      "M&A & Acqui-hires",
      "IPOs & Public Markets",
      "Venture Capital Trends",
      "YC & Accelerator Cohorts",
    ],
  },
  {
    topic: "Research",
    description:
      "Preprints, peer-reviewed publications, and breakthroughs from academia and industrial labs.",
    subThemes: [
      "AI & ML Research",
      "Robotics Research",
      "Quantum Computing",
      "Biotech & Life Sciences",
      "Materials & Energy",
      "Reproducibility & Benchmarks",
    ],
  },
  {
    topic: "Consumer Tech",
    description:
      "Gadgets, platforms, social media trends, and the behavior shifts that reshape demand.",
    subThemes: [
      "Mobile & Wearables",
      "Social Platforms",
      "Streaming & Media",
      "Gaming & Consoles",
      "Smart Home & IoT",
      "Creator Economy",
    ],
  },
  {
    topic: "Climate Tech",
    description:
      "Carbon removal, clean energy, grid technology, and the tools measuring and mitigating environmental impact.",
    subThemes: [
      "Carbon Capture & Storage",
      "Solar, Wind & Storage",
      "Grid & Smart Infrastructure",
      "Climate Measurement & MRV",
      "EVs & Transport",
      "Sustainable Materials",
    ],
  },
  {
    topic: "Biotech & Health",
    description:
      "Genomics, drug discovery, digital health, and the intersection of biology and computation.",
    subThemes: [
      "Genomics & CRISPR",
      "Drug Discovery & AI",
      "Digital Health & Wearables",
      "Diagnostics & Imaging",
      "Clinical Trials & FDA",
      "Bioinformatics & Data",
    ],
  },
  {
    topic: "Web3 & Crypto",
    description:
      "Blockchains, digital assets, DeFi, and decentralized infrastructure — the real signals beyond the speculation.",
    subThemes: [
      "Layer 1s & 2s",
      "DeFi & Protocols",
      "Stablecoins & Payments",
      "DAOs & Governance",
      "NFTs & Digital Ownership",
      "Regulatory & Compliance",
    ],
  },
  {
    topic: "Space Tech",
    description:
      "Launch vehicles, satellites, space data, and the new commercial space economy.",
    subThemes: [
      "Launch & Reusability",
      "Satellites & Earth Observation",
      "Space Data & Analytics",
      "In-Space Manufacturing",
      "Lunar & Deep Space",
      "Space Policy & Regulation",
    ],
  },
  {
    topic: "Quantum Computing",
    description:
      "Quantum hardware, algorithms, error correction, and the timeline to useful quantum advantage.",
    subThemes: [
      "Quantum Hardware (Qubits)",
      "Quantum Algorithms",
      "Error Correction",
      "Post-Quantum Cryptography",
      "Quantum Networking",
      "Commercialization Timeline",
    ],
  },
  {
    topic: "EdTech",
    description:
      "Learning platforms, AI tutoring, skills verification, and the transformation of how knowledge is delivered.",
    subThemes: [
      "AI Tutoring & Personalization",
      "Skills & Credentialing",
      "K-12 & Classroom Tech",
      "Workforce & Upskilling",
      "Open Courseware & OER",
      "Assessment & Proctoring",
    ],
  },
];
