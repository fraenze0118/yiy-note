import "server-only";

import { readFileSync, existsSync } from "fs";
import path from "path";
import type { LucideIcon } from "lucide-react";
import { getDomainIcon } from "./domain-icons";
import type { DomainDef, TopicOption } from "./types";

const DOMAINS_FILE = path.join(process.cwd(), "content", "domains.json");
const TOPICS_FILE = path.join(process.cwd(), "content", "topics.json");

function loadDomains(): DomainDef[] {
  if (!existsSync(DOMAINS_FILE)) return [];

  const raw = readFileSync(DOMAINS_FILE, "utf-8");
  const data = JSON.parse(raw) as Omit<DomainDef, "topics">[];

  let topicMap: Record<string, TopicOption[]> = {};
  if (existsSync(TOPICS_FILE)) {
    const topicsRaw = readFileSync(TOPICS_FILE, "utf-8");
    const topicsData = JSON.parse(topicsRaw) as Record<string, TopicOption[]>;
    for (const [key, nodes] of Object.entries(topicsData)) {
      topicMap[key] = nodes;
    }
  }

  return data.map((d) => ({
    ...d,
    topics: topicMap[d.key] ?? [],
  }));
}

export const domains: DomainDef[] = loadDomains();

export const domainIconMap: Record<string, LucideIcon> = new Proxy(
  {} as Record<string, LucideIcon>,
  {
    get(_, key: string) {
      return getDomainIcon(domains.find((d) => d.key === key)?.icon ?? "code2");
    },
  }
);

export function getDomain(key: string): DomainDef | undefined {
  return domains.find((d) => d.key === key);
}

export { getDomainIcon } from "./domain-icons";
