import Link from "next/link";
import { notFound } from "next/navigation";
import { SOURCES, TOPICS } from "@/lib/types";
import type { Topic } from "@/lib/types";
import { TOPIC_TAXONOMY, SOURCE_ASSESSMENTS } from "@/lib/sourceAssessments";
import { getCachedReport } from "@/lib/cache";
import { SiteNav } from "@/components/SiteNav";
import { topicColor } from "@/components/report/TopicBadge";
import { EventCard } from "@/components/report/EventCard";

export function generateStaticParams() {
  return TOPICS.map((t) => ({
    topic: t.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }));
}

// Topic-specific analysis questions (extends the brainstormer).
const TOPIC_QUESTIONS: Record<Topic, string[]> = {
  "Artificial Intelligence": [
    "Which sub-domain (vision, NLP, agents) is seeing the most method-level breakthroughs this cycle?",
    "Where is the inference-cost curve heading, and what does that unlock for real-time features?",
    "Which open-weights release narrows the gap to frontier proprietary models?",
  ],
  Robotics: [
    "Which environment (warehouse, outdoor, surgical) is seeing the fastest deployment velocity?",
    "Are hardware costs or software robustness the current bottleneck to commercialization?",
    "Which sim-to-real technique is gaining the most traction?",
  ],
  "Open Source": [
    "Which trending project has the maintainer health to sustain long-term adoption?",
    "Is there a commercial-services opportunity (hosting, support, security) around this project?",
    "Which license change or governance shift affects the ecosystem risk profile?",
  ],
  "Developer Tools": [
    "Which tool is being absorbed into a platform's native offering, and what does that mean for independents?",
    "What's the build-time or DX improvement that would make this a must-adopt?",
    "Which AI-powered DevEx tool is genuinely reducing cycle time vs. adding noise?",
  ],
  Cybersecurity: [
    "Which CVE or threat pattern should trigger a control review this week?",
    "Is there a defensive technique (detection, deception, hardening) worth adopting from the threat side?",
    "Which supply-chain or identity signal indicates a shift in the attack surface?",
  ],
  "Hardware & Chips": [
    "Which price/performance shift makes a workload newly viable (on-device, edge, training)?",
    "What geopolitical or export-control signal affects your hardware dependency?",
    "Is there a co-design opportunity (custom silicon + software) that creates a moat?",
  ],
  "Startups & Funding": [
    "Which funded category signals a market opening for a fast-follower or picks-and-shovels play?",
    "What hiring or acqui-hire pattern indicates where talent is consolidating?",
    "Which valuation trend suggests a bubble vs. durable value creation?",
  ],
  Research: [
    "Which result, if it generalizes, changes a product roadmap decision in your domain?",
    "Is there an open dataset or benchmark here you could use to build a defensible evaluation?",
    "Which technique is closest to being adopted by a product team or startup?",
  ],
  "Consumer Tech": [
    "Which behavior shift hints at a feature expectation your users will soon have?",
    "Is there a form-factor or interaction pattern worth prototyping before competitors?",
    "What platform-policy risk should inform a build-vs. dependency decision?",
  ],
  "Climate Tech": [
    "Which policy or subsidy change (IRA, EU Green Deal) creates a market-creation signal?",
    "Is there an MRV (monitoring, reporting, verification) angle where your data adds defensible value?",
    "Which cost-curve milestone (solar, storage, hydrogen) makes a previously-marginal tech viable?",
  ],
  "Biotech & Health": [
    "Which clinical-trial milestone or FDA decision opens or closes a product pathway?",
    "Is there a non-therapeutic application (wellness, performance, ag) with faster time-to-market?",
    "Which data-advantage (proprietary dataset, patient cohort) creates a moat?",
  ],
  "Web3 & Crypto": [
    "Which protocol or stablecoin signal indicates organic adoption vs. speculation?",
    "Is there a token-incentive or governance model repurposable for a non-crypto marketplace?",
    "Which regulatory enforcement (SEC, MiCA) reshapes the market structure?",
  ],
  "Space Tech": [
    "Which launch-cost or cadence milestone makes a downstream product viable?",
    "Is there an earth-observation or comms data layer worth productizing for a terrestrial use case?",
    "Which regulatory (spectrum, orbital-slot) decision affects the competitive landscape?",
  ],
  "Quantum Computing": [
    "Which qubit-count or error-correction milestone narrows the timeline to quantum advantage?",
    "Should you start building post-quantum crypto migration as a service now?",
    "Which optimization workload is the first to benefit from near-term NISQ devices?",
  ],
  EdTech: [
    "Which AI-tutoring or personalization signal suggests a feature expectation from your users?",
    "Is there a credentialing or skills-verification layer employers would pay for?",
    "Which institutional-adoption signal indicates scale vs. consumer-only reach?",
  ],
};

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = TOPICS.find(
    (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );
  if (!topic) notFound();

  const tax = TOPIC_TAXONOMY.find((t) => t.topic === topic)!;
  const color = topicColor(topic);
  const report = getCachedReport();
  const topicEvents = report
    ? report.events.filter((e) => e.topics.includes(topic))
    : [];

  // Sources that cover this topic.
  const coveringSources = SOURCE_ASSESSMENTS.filter((s) =>
    s.coverage.includes(topic)
  );

  const questions = TOPIC_QUESTIONS[topic];

  return (
    <main className="min-h-full bg-background">
      <SiteNav />
      {/* Topic hero */}
      <header
        className="hero-grid border-b border-white/10 text-white"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}cc 50%, #15202e)`,
        }}
      >
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="text-xs uppercase tracking-[0.24em] text-gold-soft">
            Focus Topic
          </div>
          <h1 className="mt-3 font-serif-display text-4xl font-semibold md:text-5xl">
            {topic}
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/65">
            {tax.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <span className="text-white/60">
              Sub-themes:{" "}
              <span className="font-semibold text-gold-soft tnum">
                {tax.subThemes.length}
              </span>
            </span>
            <span className="text-white/60">
              Covering sources:{" "}
              <span className="font-semibold text-gold-soft tnum">
                {coveringSources.length}
              </span>
            </span>
            <span className="text-white/60">
              Today&apos;s events:{" "}
              <span className="font-semibold text-gold-soft tnum">
                {topicEvents.length}
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Sub-themes */}
        <section>
          <h2 className="font-serif-display text-2xl font-semibold text-ink">
            Sub-themes
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tax.subThemes.map((st, i) => (
              <div
                key={st}
                className="paper-card paper-card-hover p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-serif-display text-sm tnum"
                    style={{ color }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-ink/85">{st}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Covering sources */}
        <section className="mt-10">
          <h2 className="font-serif-display text-2xl font-semibold text-ink">
            Sources covering this topic
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {coveringSources.map((s) => {
              const meta = SOURCES[s.id];
              return (
                <Link
                  key={s.id}
                  href={`/sources/${s.id}`}
                  className="paper-card paper-card-hover p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: meta.accent }}
                    />
                    <span className="font-medium text-navy">{meta.label}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-muted">
                    {s.reliability.type} · {s.cadence} · {s.reliability.quality} quality
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Topic-specific questions */}
        <section className="paper-card mt-10 bg-surface-2 p-6">
          <h2 className="font-serif-display text-2xl font-semibold text-ink">
            Topic-specific analysis questions
          </h2>
          <ol className="mt-4 space-y-3">
            {questions.map((q, i) => (
              <li
                key={i}
                className="flex gap-3 text-[14px] leading-snug text-ink-soft"
              >
                <span
                  className="font-serif-display tnum"
                  style={{ color }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Today's events */}
        {topicEvents.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif-display text-2xl font-semibold text-ink">
              Today&apos;s events in {topic}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
              {topicEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-indigo underline decoration-gold decoration-2 underline-offset-2 hover:text-gold"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
