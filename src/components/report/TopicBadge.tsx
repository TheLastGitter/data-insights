import type { Topic } from "@/lib/types";

const TOPIC_COLOR: Record<Topic, string> = {
  "Artificial Intelligence": "#6e40c9",
  Robotics: "#8c2f0d",
  "Open Source": "#2e7d5b",
  "Developer Tools": "#1f2d4a",
  Cybersecurity: "#b3122d",
  "Hardware & Chips": "#555555",
  "Startups & Funding": "#b08a3e",
  Research: "#00629b",
  "Consumer Tech": "#5200ff",
  "Climate Tech": "#0d7c66",
  "Biotech & Health": "#0a7c4a",
  "Web3 & Crypto": "#9b59b6",
  "Space Tech": "#1a3a5c",
  "Quantum Computing": "#004e92",
  EdTech: "#c0392b",
};

export function TopicBadge({ topic }: { topic: Topic }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        color: TOPIC_COLOR[topic],
        background: `${TOPIC_COLOR[topic]}1a`,
      }}
    >
      {topic}
    </span>
  );
}

export function topicColor(topic: Topic): string {
  return TOPIC_COLOR[topic];
}
