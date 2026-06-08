import "server-only";

import { readFileSync, existsSync } from "fs";
import { cache } from "react";
import type { LucideIcon } from "lucide-react";
import { getDomainIcon } from "./domain-icons";
import type { DomainDef, TopicOption } from "./types";

import { DOMAINS_FILE, TOPICS_FILE } from "./data-path";

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

/** 每次请求重新读取文件，确保新增/编辑的节点立即可见 */
export const getDomains = cache(loadDomains);

export function getDomain(key: string): DomainDef | undefined {
  return getDomains().find((d) => d.key === key);
}

/** 按 key 解析领域图标 */
export function getDomainIconByKey(key: string): LucideIcon {
  return getDomainIcon(getDomain(key)?.icon ?? "code2");
}

export { getDomainIcon } from "./domain-icons";
